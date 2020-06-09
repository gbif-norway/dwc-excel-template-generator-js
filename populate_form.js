const dwcTranslationsObj = dwcTranslations.reduce(function(obj, item) {
    obj[item['localName']] = item;
    return obj;
})

const dwcTerms = occurrenceTerms.reduce(function(obj, item) { /* Merges terms + translations, and organises */
    const termName = item['_name'];
    const allElements = {...item, ...dwcTranslationsObj[termName]}
    const org = item['_group'];
    obj[org] = obj[org] ? obj[org] : [];
    obj[org].push(allElements);
    return obj;
}, {})

const form = document.getElementById('excelForm');
for(let [organization_url, terms] of Object.entries(dwcTerms)) { /* Build the html user input form used to select options for the generated excel template */
    const fieldset = document.createElement('fieldset')
    fieldset.setAttribute('id', organization_url.toLowerCase());
    fieldset.appendChild(Object.assign(document.createElement('legend'), {textContent: organization_url}));

    terms.forEach(term => {
        const label = document.createElement('label')
        label.textContent = term['_name'];
        label.appendChild(Object.assign(document.createElement('input'), {type: 'checkbox', name: term['_name'], checked: defaults.includes(term['_name'])}));
        label.setAttribute('data-skos_definition_en', term['skos_definition_en']);
        label.setAttribute('data-skos_definition_es', term['skos_definition_es']);
        label.setAttribute('data-skos_definition_ja', term['skos_definition_ja']);
        label.setAttribute('data-skos_definition_zh_hans', term['skos_definition_zh_hans']);
        label.setAttribute('data-skos_prefLabel_en', term['skos_prefLabel_en']);
        label.setAttribute('data-skos_prefLabel_es', term['skos_prefLabel_es']);
        label.setAttribute('data-skos_prefLabel_ja', term['skos_prefLabel_ja']);
        label.setAttribute('data-skos_prefLabel_zh_hans', term['skos_prefLabel_zh_hans']);
        label.onmouseover = function(e) {
            var lang = document.getElementById('language').value;
            document.getElementById('asideHeading').textContent = term['_name'];
            if('skos_prefLabel_' + lang in term) {
                document.getElementById('asideHeading').textContent = term['_name'] +  ' (' + term['skos_prefLabel_' + lang]+ ')';
            }
            document.getElementById('asideDef').textContent = term['_dc:description'];
            if('skos_definition_' + lang in term) {
                document.getElementById('asideDef').textContent = term['skos_definition_' + lang];
            } else if(lang != 'en') {
                document.getElementById('asideDef').textContent = '[No translation available] - ' + term['_dc:description'];
            }
            document.getElementById('asideEg').textContent = 'Eg: ' + term['_examples'];
        }
        fieldset.appendChild(label);
    })
    form.appendChild(fieldset);
};
