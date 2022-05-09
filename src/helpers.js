import _, { find, capitalize, isString } from 'lodash-es'
import { requestTranslation } from '@sangre-fp/i18n'

export const addOrRemoveValueFromArray = (array, value) => find(array, value) ? _.filter(array, v => {
    if (typeof v?.label === 'string' && typeof value?.label  === 'string') {
        return (v.label !== value.label)
    } else if (typeof value?.label  === 'object' && typeof v?.label  === 'object') {
        return (JSON.stringify(value?.label) !== JSON.stringify(v?.label) )
    } else if (typeof value?.label  === 'object' && typeof v?.label  === 'string') {
        return (v?.label !== value?.label?.fi && v?.label !== value?.label?.en)
    } else if (typeof v?.label  === 'object' && typeof value?.label  === 'string') {
        if (!!v?.label?.fi) {
            return (value?.label !== v?.label?.fi)
        } else if (!!v?.label?.en) {
            return (value?.label !== v?.label?.en)
        }
    } else {
        return (JSON.stringify(value?.label) !== JSON.stringify(v?.label) )
    }
}) : [...array, value]

export const getTypeLabel = selectedTypes => selectedTypes.map(({ label }) => capitalize(requestTranslation(label) || label)).join(', ')

export const getTimeLabel = selectedTimes => selectedTimes.map(({ label }) => capitalize(label)).join(', ')

export const getTagLabel = (selectedTags, selectedLanguage) => {
    const lang = selectedLanguage.value === 'all' ? document.querySelector('html').getAttribute('lang') || 'en' : selectedLanguage.value

    const labels = selectedTags.map(({ label }) => (isString(label) ? label : label[lang]))

    return labels.join(', ')
}


