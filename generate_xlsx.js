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

    if(document.getElementById('measurementorfactcheck').checked) {
        const mofworksheet = workbook.addWorksheet('MeasurementOrFacts');
        mof = ["measurementID", "measurementType", "measurementValue", "measurementAccuracy", "measurementUnit", "measurementDeterminedBy", "measurementDeterminedDate", "measurementMethod"];
        mofworksheet.columns = mof.map(column => ({'header': column, 'width': column.length}));
    }

    workbook.xlsx.writeBuffer()
      .then(buffer => saveAs(new Blob([buffer]), `${Date.now()}_feedback.xlsx`))
      .catch(err => console.log('Error writing excel export', err))
}
