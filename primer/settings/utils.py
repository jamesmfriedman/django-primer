def unique(sequence):
    """
    A generator to return a unique set of items from our settings
    This prevents us from adding in something that was already present
    """
    seen = set()
    for item in sequence:
        if item not in seen:
            seen.add(item)
            yield item


def merge_settings(core_settings, primer_settings):
    """
    This merges primer settings in AFTER django settings
    but before any additional settings. This supports the idea
    that PRIMER is a set of extensions for Django, but comes before
    someones additional apps and overrides
    """
    index = len(core_settings)
    for i in range(index):
        item = core_settings[i]
        if item.find('django') != 0:
            index = i
            break

    merged_settings = unique(list(core_settings)[0:index] + primer_settings + list(core_settings)[index:])
    
    return tuple(merged_settings)