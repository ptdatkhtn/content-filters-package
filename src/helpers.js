import { find, capitalize, isString } from 'lodash-es'
import { requestTranslation } from '@sangre-fp/i18n'

export const addOrRemoveValueFromArray = (array, value) => find(array, value) ? _.filter(array, v => (
    (v.label !== value.label)
     && ((value?.label?.fi && v?.label?.fi) ? value?.label?.fi !== v?.label?.fi :  null)
     && ((value?.label?.en && v?.label?.en) ? value?.label?.en !== v?.label?.en :  null)
     && ((value?.label?.fi && typeof v?.label === 'string') ? value?.label?.fi !== v?.label :  null)
     && ((value?.label?.en && typeof v?.label === 'string') ? value?.label?.en !== v?.label :  null)
     && ((typeof value?.label  === 'string' && v?.label === 'object') ? (value?.label !== v?.label?.fi && value?.label !== v?.label?.en) :  null)
)) : [...array, value]

export const getTypeLabel = selectedTypes => selectedTypes.map(({ label }) => capitalize(requestTranslation(label) || label)).join(', ')

export const getTimeLabel = selectedTimes => selectedTimes.map(({ label }) => capitalize(label)).join(', ')

export const getTagLabel = (selectedTags, selectedLanguage) => {
    const lang = selectedLanguage.value === 'all' ? document.querySelector('html').getAttribute('lang') || 'en' : selectedLanguage.value

    const labels = selectedTags.map(({ label }) => (isString(label) ? label : label[lang]))

    return labels.join(', ')
}


