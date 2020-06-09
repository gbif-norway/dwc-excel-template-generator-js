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

function uuidv4() { /* https://stackoverflow.com/questions/105034/how-to-create-guid-uuid */
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const generateXLSX = async() => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Occurrences');
    const lang = document.getElementById('language').value;
    const selectedColumns = Array.from(document.getElementById('excelForm').querySelectorAll('input[type=checkbox]:checked'));
    columns = selectedColumns.map(column => ({
        'header': column['name'],
        'note': column.parentElement.dataset['skos_definition_' + lang].replace(/\s+/gm, ' '),
        'width': column['name'].length
    }));
    worksheet.columns = columns;

    const headerRow = worksheet.getRow(1);
    for(const [i, column] of Object.entries(columns)) {
        let cell = headerRow.getCell(parseInt(i) + 1);
        if(column['note'] != 'undefined') { cell.note = column['note'] }
        cell.style = {font: {bold: true}, fill: {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFAA'}}};
    };

    workbook.xlsx.writeBuffer()
      .then(buffer => saveAs(new Blob([buffer]), `${Date.now()}_feedback.xlsx`))
      .catch(err => console.log('Error writing excel export', err))
}
