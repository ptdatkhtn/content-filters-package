import React, { Fragment, useState, useEffect } from 'react'
import { requestTranslation, radarLanguagesWithAll, setLanguage } from '@sangre-fp/i18n'
import { OptionDropdown, TagOptionDropdown, TimelineOptionDropdown, Loading } from '@sangre-fp/ui'
import { useTags, usePhenomenonTypes, useGroups, useEditableGroups } from '@sangre-fp/hooks'
import { useDebounce } from 'use-debounce'
import { addOrRemoveValueFromArray, getTypeLabel, getTimeLabel, getTagLabel } from './helpers'
import { map, concat, find, filter } from 'lodash-es'

const PUBLIC_GROUP = { value: 0, label: requestTranslation('publicWord') }
const USER_LANGUAGE = document.querySelector('html').getAttribute('lang') || 'en'
const SELECTED_LANGUAGE = find(radarLanguagesWithAll(), { value: USER_LANGUAGE })
const DEFAULT_TIMES = { min: new Date().getFullYear(), max: null }
const SEARCH_DEBOUNCE_MS = 350

setLanguage(USER_LANGUAGE)

const ContentFilters = ({
  onFilterChange,
  page,
  search,
  passedGroups = false,
  countShown = true,
  resetShown = true,
  manualFilterReset,
  groupsProp,
  groupsLoading,
  highest_group_role
}) => {
  if (!groupsProp || groupsProp === undefined) {
    const resetFilters = () => {
      setSelectedTypes([])
      setSelectedTimes(DEFAULT_TIMES)
      setSelectedTags([])
      setSelectedLanguage(SELECTED_LANGUAGE)
      setSelectedGroup(PUBLIC_GROUP)
    }
  
    const areFiltersApplied = () => {
      if (selectedTypes.length || selectedTimes !== DEFAULT_TIMES || selectedTags.length || selectedLanguage !== SELECTED_LANGUAGE || selectedGroup !== PUBLIC_GROUP) {
        return true
      }
  
      return false
    }
  
    const [typesShown, setTypesShown] = useState(false)
    const [timesShown, setTimesShown] = useState(false)
    const [tagsShown, setTagsShown] = useState(false)
    const [groupsShown, setGroupsShown] = useState(false)
    const [languagesShown, setLanguagesShown] = useState(false)
  
    const [selectedTypes, setSelectedTypes] = useState([])
    const [selectedTimes, setSelectedTimes] = useState(DEFAULT_TIMES)
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedLanguage, setSelectedLanguage] = useState(SELECTED_LANGUAGE)
    const [selectedGroup, setSelectedGroup] = useState(PUBLIC_GROUP)
    const [debouncedSearchValue, clearTimeout] = useDebounce(search, SEARCH_DEBOUNCE_MS)
  
    const {
      loading: phenomenaTypesLoading,
      phenomenonTypes,
      phenomenonTypesById
    } = usePhenomenonTypes(selectedGroup.value)
  
    const { loading: groupsLoading, groups } = useGroups()
  
    const loading = phenomenaTypesLoading || groupsLoading
    const groupOptions = passedGroups || concat([PUBLIC_GROUP], filter(groups, group => group.id))
  
    useEffect(() => {
      onFilterChange({
        types: selectedTypes,
        times: selectedTimes,
        tags: selectedTags,
        language: selectedLanguage,
        group: selectedGroup,
        page,
        search: debouncedSearchValue,
        filtersActive: areFiltersApplied()
      })
    }, [
      selectedTypes,
      selectedTimes,
      selectedTags,
      selectedLanguage,
      selectedGroup,
      page,
      debouncedSearchValue
    ])
  
    useEffect(() => {
      if (manualFilterReset) {
        resetFilters()
      }
    }, [manualFilterReset])
  
    return (
      <Fragment>
        {loading && <div className="py-2 pl-2">{requestTranslation('loading')}</div>}
        <div className='mb-3'>
            <OptionDropdown
                label={requestTranslation('createPhenomenaFormTypeLabel')}
                optionsShown={typesShown}
                type={'type'}
                title={selectedTypes.length ? getTypeLabel(selectedTypes) : requestTranslation('all')}
                selectedOption={selectedTypes}
                handleOptionSelect={type => setSelectedTypes(addOrRemoveValueFromArray(selectedTypes, type))}
                options={map(phenomenonTypes, type => ({
                  value: type.id,
                  label: type.alias || type.title || type.label,
                  style: type.style
                }))}
                onTabClick={() => setTypesShown(!typesShown)}
                resetFilters={() => setSelectedTypes([])}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <TimelineOptionDropdown
                label={requestTranslation('time')}
                optionsShown={timesShown}
                title={`${selectedTimes.min || ''} - ${selectedTimes.max || ''}`}
                selectedOption={selectedTimes}
                handleOptionSelect={times => setSelectedTimes(times)}
                onTabClick={() => setTimesShown(!timesShown)}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <TagOptionDropdown
                label={requestTranslation('tags')}
                optionsShown={tagsShown}
                title={selectedTags.length === 0 ? requestTranslation('none') : getTagLabel(selectedTags, selectedLanguage)}
                selectedOption={selectedTags}
                handleOptionSelect={tag => setSelectedTags(addOrRemoveValueFromArray(selectedTags, tag))}
                onTabClick={() => setTagsShown(!tagsShown)}
                group={selectedGroup.value}
                language={selectedLanguage.value}
                countShown={countShown}
                useTags={useTags}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <OptionDropdown
                label={requestTranslation('group')}
                title={selectedGroup.label}
                type={'radio'}
                optionsShown={groupsShown}
                options={groupOptions}
                selectedOption={selectedGroup}
                onTabClick={() => setGroupsShown(!groupsShown)}
                handleOptionSelect={e =>  setSelectedGroup(find(groupOptions, { label: e.target.innerText }))}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <OptionDropdown
                label={requestTranslation('language')}
                title={selectedLanguage.label}
                type={'radio'}
                optionsShown={languagesShown}
                options={radarLanguagesWithAll()}
                selectedOption={selectedLanguage}
                handleOptionSelect={e => setSelectedLanguage(find(radarLanguagesWithAll(), { label: e.target.innerText }))}
                onTabClick={() => setLanguagesShown(!languagesShown)}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        {resetShown && (
          <button 
            style={{opacity: highest_group_role ==='free' ? 0.5 : 1}}
            disabled={highest_group_role ==='free'}
            className='btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center' onClick={resetFilters}>
              <i className='material-icons mr-1' style={{ fontSize: '16px' }}>replay</i>
              {requestTranslation('resetFilters')}
          </button>
        )}
      </Fragment>
    )
  }
  else {
    const resetFilters = () => {
      setSelectedTypes([])
      setSelectedTimes(DEFAULT_TIMES)
      setSelectedTags([])
      setSelectedLanguage(SELECTED_LANGUAGE)
      setSelectedGroup(ALL_GROUP)
    }
  
    const areFiltersApplied = () => {
      if (selectedTypes.length || selectedTimes !== DEFAULT_TIMES || selectedTags.length || selectedLanguage !== SELECTED_LANGUAGE || selectedGroup !== PUBLIC_GROUP) {
        return true
      }
  
      return false
    }
  
    // const { loading: groupsLoading } = useGroups()
  
    const loading = phenomenaTypesLoading || groupsLoading
  
    const allGroups = groupsProp?.map( g => {
      return g.value
    })
    // const bc = filter(groups, group => group.label).sort( (a,b) => {
    //   if (a.label < b.label) {
    //     return -1;
    //   }
    //   if (a.label > b.label) {
    //     return 1;
    //   }
    
    //   // names must be equal
    //   return 0;
    // }).map(g => {
    //   return g.value
    // })
    const ALL_GROUP = { value: passedGroups || concat([PUBLIC_GROUP.value], allGroups), label: requestTranslation('allWord')}
  
      const sortedGroups = filter(groupsProp, group => group.label).sort( (a,b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      })
    const groupOptions = passedGroups || concat([ALL_GROUP, PUBLIC_GROUP], sortedGroups)
  
    const [typesShown, setTypesShown] = useState(false)
    const [timesShown, setTimesShown] = useState(false)
    const [tagsShown, setTagsShown] = useState(false)
    const [groupsShown, setGroupsShown] = useState(false)
    const [languagesShown, setLanguagesShown] = useState(false)
  
    const [selectedTypes, setSelectedTypes] = useState([])
    const [selectedTimes, setSelectedTimes] = useState(DEFAULT_TIMES)
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedLanguage, setSelectedLanguage] = useState(SELECTED_LANGUAGE)
    const [selectedGroup, setSelectedGroup] = useState(ALL_GROUP)
    const [debouncedSearchValue, clearTimeout] = useDebounce(search, SEARCH_DEBOUNCE_MS)
  
    const {
      loading: phenomenaTypesLoading,
      phenomenonTypes,
      phenomenonTypesById
    } = usePhenomenonTypes(selectedGroup.value)
  
    
  
    useEffect(() => {
      onFilterChange({
        types: selectedTypes,
        times: selectedTimes,
        tags: selectedTags,
        language: selectedLanguage,
        group: selectedGroup,
        page,
        search: debouncedSearchValue,
        filtersActive: areFiltersApplied()
      })
    }, [
      selectedTypes,
      selectedTimes,
      selectedTags,
      selectedLanguage,
      selectedGroup,
      page,
      debouncedSearchValue
    ])
  
    useEffect(() => {
      if (manualFilterReset) {
        resetFilters()
      }
    }, [manualFilterReset])
  
    return (
      <Fragment>
        {loading && <div className="py-2 pl-2">{requestTranslation('loading')}</div>}
        <div className='mb-3'>
            <OptionDropdown
                id="type-cont-exp-filter"
                label={requestTranslation('createPhenomenaFormTypeLabel')}
                optionsShown={typesShown}
                type={'type'}
                title={selectedTypes.length ? getTypeLabel(selectedTypes) : requestTranslation('all')}
                selectedOption={selectedTypes}
                handleOptionSelect={type => setSelectedTypes(addOrRemoveValueFromArray(selectedTypes, type))}
                options={map(phenomenonTypes, type => ({
                  value: type.id,
                  label: type.alias || type.title || type.label,
                  style: type.style
                }))}
                onTabClick={() => setTypesShown(!typesShown)}
                resetFilters={() => setSelectedTypes([])}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <TimelineOptionDropdown
                id="time-cont-exp-filter"
                label={requestTranslation('time')}
                optionsShown={timesShown}
                title={`${selectedTimes.min || ''} - ${selectedTimes.max || ''}`}
                selectedOption={selectedTimes}
                handleOptionSelect={times => setSelectedTimes(times)}
                onTabClick={() => setTimesShown(!timesShown)}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <TagOptionDropdown
                id="tags-cont-exp-filter"
                label={requestTranslation('tags')}
                optionsShown={tagsShown}
                title={selectedTags.length === 0 ? requestTranslation('none') : getTagLabel(selectedTags, selectedLanguage)}
                selectedOption={selectedTags}
                handleOptionSelect={tag => setSelectedTags(addOrRemoveValueFromArray(selectedTags, tag))}
                onTabClick={() => setTagsShown(!tagsShown)}
                group={selectedGroup.value}
                language={selectedLanguage.value}
                countShown={countShown}
                useTags={useTags}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <OptionDropdown
                id="group-cont-exp-filter"
                label={requestTranslation('group')}
                title={selectedGroup.label}
                type={'radio'}
                optionsShown={groupsShown}
                options={groupOptions}
                selectedOption={selectedGroup}
                onTabClick={() => setGroupsShown(!groupsShown)}
                handleOptionSelect={e =>  setSelectedGroup(find(groupOptions, { label: e.target.innerText }))}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        <div className='mb-3'>
            <OptionDropdown
                id="lang-cont-exp-filter"
                label={requestTranslation('language')}
                title={selectedLanguage.label}
                type={'radio'}
                optionsShown={languagesShown}
                options={radarLanguagesWithAll()}
                selectedOption={selectedLanguage}
                handleOptionSelect={e => setSelectedLanguage(find(radarLanguagesWithAll(), { label: e.target.innerText }))}
                onTabClick={() => setLanguagesShown(!languagesShown)}
                countShown={countShown}
                highest_group_role={highest_group_role}
                disabled={highest_group_role ==='free'}
            />
        </div>
        {resetShown && (
          <button 
            style={{opacity: highest_group_role ==='free' ? 0.5 : 1}}
            disabled={highest_group_role ==='free'}
            className='btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center' onClick={resetFilters}>
              <i className='material-icons mr-1' style={{ fontSize: '16px' }}>replay</i>
              {requestTranslation('resetFilters')}
          </button>
        )}
      </Fragment>
    )
  }
}

export default ContentFilters
