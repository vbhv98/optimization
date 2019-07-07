let data_json = [],
    counter = {}
function arraysEqual(a, b) {
    if (a instanceof Array && b instanceof Array) {
        if (a.length != b.length) return false
        for (var i = 0; i < a.length; i++) if (!arraysEqual(a[i], b[i])) return false
        return true
    } else {
        return a == b
    }
}

function generateTable() {
    var data = document.querySelector('textarea[name=excel_data]').value
    var rows = data.trim().split('\n')

    var table = document.createElement('table')

    let fields = ['S', 'W', 'Q', 'H', 'Q'] //rows[0].split('\t')

    for (let y = 1; y < rows.length; y++) {
        var cells = rows[y].split('\t')
        var row = document.createElement('tr')
        for (var x in cells) {
            row.innerHTML += '<td>' + cells[x] + '</td>'
        }
        if (fields) data_json.push(Object.assign(...fields.map((k, i) => ({ [k]: cells[i] }))))
        table.append(row)
    }

    // Insert into DOM
    document.querySelector('#excel_table').append(table)
}

const generateSubmitData = data_json => {
    let data = []
    data_json.forEach(e => {
        for (let i = 0; i < e.Q; i++) {
            data.push(parseInt(e.W))
            data.push(parseInt(e.H))
        }
    })
    return data
}

let data

const submit = async () => {
    const postData = generateSubmitData(data_json).sort((a, b) => {
        return a < b ? 1 : a === b ? 0 : -1
    })
    const len = document.getElementById('length').value
    const res = await fetch('/getresult', {
        method: 'POST',
        body: JSON.stringify({ array: postData, length: len }),
        header: {
            'Content-Type': 'application/json',
        },
    })
    data = JSON.parse((await res.json()).replace(/\'/g, '"'))
    data.forEach(e => {
        if (counter[JSON.stringify(e)]) counter[JSON.stringify(e)] += 1
        else counter[JSON.stringify(e)] = 1
    })

    function sortObject(obj) {
        var arr = []
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                arr.push({
                    key: prop,
                    value: obj[prop],
                })
            }
        }
        arr.sort(function(a, b) {
            return b.value - a.value
        })
        return arr // returns array
    }

    counter = sortObject(counter)

    document.body.innerHTML = `
    <input type="button" onclick="javascript:down()" value="Export Table Data To Excel File" />
        <table id="tblData" border=1>
            <thead>
                <tr>
                    <td>PICES TO CUT (from each profile)</td>
                    <td>Number Of Profile</td>
                    <td>Waste</td>
                </tr>
            </thead>
            ${counter.map(e => {
                const { items, unused } = JSON.parse(e.key)
                const multiplier = e.value
                return `
                        <tr>
                            <td style="display: flex">${items
                                .map(itm => {
                                    return `
                                    <div style="display: inline-block;
                                    width:${(itm * 100) / len}%;
                                    border: 1px dotted white">${itm}</div>
                                `
                                })
                                .join('')}</td>
                            <td>${multiplier}</td>
                            <td>${unused}</td>
                        </tr>
                    `
            })}
        </table>

    `

    console.log(data)
}

document.querySelector('button').addEventListener('click', submit)
function down() {
    alert('generating')
    var downloadLink
    var dataType = 'application/vnd.ms-excel'
    var tableSelect = document.getElementById('tblData')
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20')

    // Specify file name
    filename = 'exported_data.xls'

    // Create download link element
    downloadLink = document.createElement('a')

    document.body.appendChild(downloadLink)

    if (navigator.msSaveOrOpenBlob) {
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType,
        })
        navigator.msSaveOrOpenBlob(blob, filename)
    } else {
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML

        // Setting the file name
        downloadLink.download = filename

        //triggering the function
        downloadLink.click()
    }
}
