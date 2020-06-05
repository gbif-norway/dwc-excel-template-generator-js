const dwcTranslationsObj = dwcTranslations.reduce(function(obj, item) {
    obj[item['localName']] = item;
    return obj;
})

const recommendedTerms = term_versions.filter(function(item) { return item['status'] == 'recommended' && item['organized_in'] != ''; })

const dwcTerms = recommendedTerms.reduce(function(obj, item) {
    const termName = item['term_iri'].split('/').pop();
    const allElements = {...item, ...dwcTranslationsObj[termName]}
    const org = item['organized_in'].replace(/\/$/g, '').split('/').pop();
    obj[org] = obj[org] ? obj[org] : [];
    obj[org].push(allElements);
    return obj;
}, {})

const form = document.getElementById('excelForm');
for(let [organization_url, terms] of Object.entries(dwcTerms)) {
    const fieldset = document.createElement('fieldset')
    //const organization_label = organization_url.replace(/\/$/g, '').split('/').pop();

    fieldset.appendChild(Object.assign(document.createElement('legend'), {textContent: organization_url}));
    terms.forEach(term => {
        const label = document.createElement('label')
        label.textContent = term['label'];
        label.appendChild(Object.assign(document.createElement('input'), {type: 'checkbox', value: 'y', name: term['label']}));
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
            document.getElementById('asideHeading').textContent = term['label'];
            document.getElementById('asideDef').textContent = term['skos_definition_' + lang];
            document.getElementById('asideComments').textContent = term['comments'];
            document.getElementById('asideEg').textContent = 'Eg: ' + term['examples'];
        }
        fieldset.appendChild(label);
    })
    form.appendChild(fieldset);
};

const generateXLSX = async() => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');
    worksheet.getColumn(6).values = [1,2,3,4,5];
    workbook.xlsx.writeBuffer()
      .then(buffer => saveAs(new Blob([buffer]), `${Date.now()}_feedback.xlsx`))
      .catch(err => console.log('Error writing excel export', err))
}
