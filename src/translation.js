var translation = {
    methods: {
        __(key, replace) {
            let translation, translationNotFound = true
            try {
                translation = key.split('.').reduce((t, i) => t[i] || null, window._translations[window._locale])

                if (translation) {
                    translationNotFound = false
                }
            } catch (e) {
                translation = key
            }

            if (translationNotFound) {
                translation = window._translations[window._locale][key]
                    ? window._translations[window._locale][key]
                    : key
            }
            _.forEach(replace, (value, key) => {
                translation = translation.replace(':' + key, value)
            })

            return translation
        }
    },
}

export default translation
