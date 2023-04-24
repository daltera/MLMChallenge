function getBonus(){
    let id = document.getElementsByClassName('bonus-selector')[0].value
    fetch(`http://localhost:3000/bonus/${id}`,)
    .then(res => res.json())
    .then(data => {
        document.getElementsByClassName('bonus-field')[0].value = data.profit
    })
}

function registerMember(){
    let parent = document.getElementsByClassName('member-parent-selector')[0].value
    let initial = document.getElementsByClassName('member-initial')[0].value
    let obj = {parent, initial}

    fetch(`http://localhost:3000/insert`, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },      
    })
    .then(res => res.json())
    .then(data => {
        document.getElementsByClassName('newId-field')[0].value = data.member_id
        document.getElementsByClassName('refresh-button')[0].style = "display: block"
        window.location.reload()
    })
}

function updateMember(){
    let id = document.getElementsByClassName('member-update-selector')[0].value
    let newParent = document.getElementsByClassName('update-parent-selector')[0].value
    let obj = {id, newParent}

    fetch('http://localhost:3000/update', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },         
    })
    .then(res => res.json())
    .then(data => {
        document.getElementsByClassName('newLevel-field')[0].value = data.newLevel
        document.getElementsByClassName('refresh-button')[0].style = "display: block"
        window.location.reload()
    })
}
let optionsData = []
function clearOptions(){
    let els = document.getElementsByClassName('parent-update-options')
    while (els.length > 1){
        els[0].parentNode.removeChild(els[0])
    }
}


function updateAvailableParents(){
    let oldOptions = [...optionsData]
    let node = parseInt(document.getElementsByClassName('member-update-selector')[0].value)

    let newOptions = removeInvalidParents(oldOptions, node)
    let updateParentSelector = document.getElementsByClassName('update-parent-selector')[0]
    updateParentSelector.disabled = false

    let supplementalData = newOptions.filter(el => parseInt(el.id) === node)

    clearOptions()
    newOptions.forEach(el => {
        if (parseInt(el.id) !== node){
            if (parseInt(el.id) !== parseInt(supplementalData[0].parent)){
                let element = document.getElementsByClassName('parent-update-options')[0].cloneNode()
                element.value =  el.id
                element.innerHTML = el.initial
                updateParentSelector.appendChild(element)
            }
        }
    })
    let deletedNode = document.getElementsByClassName('parent-update-options')[0]
    deletedNode.parentNode.removeChild(deletedNode)
}

function removeInvalidParents(options, node){
    let isChild = function(el, node){
        while (parseInt(el.parent) !== 0){
            if (parseInt(el.parent) === parseInt(node)){
                return true
            } else {
                let dat = options.filter(unit => {
                    return parseInt(unit.id) == parseInt(el.parent)
                })
                el = dat[0]
            }
        }
        return false
    }

    let invalidNodes = []
    let length = options.length
    let i = 0
    options.forEach(el => {
        if (isChild(el, node)){
            invalidNodes.push(el)
        }
    })
    invalidNodes.forEach(el => {
        for (let i = 0; i < options.length; i++){
            if (parseInt(el.id) === (options[i].id)){
                options.splice(i, 1)
                break
            }
        }
    })
    return options

}


fetch('http://localhost:3000/')
.then(res => res.json())
.then(data => {
    let elements = []
    let elementsId = []
    optionsData = [...data]
    data.forEach(el => {
        if (el.children !== ''){
            let arr = el.children.split(',')
            arr.forEach(arrData => elements.push([el.id, parseInt(arrData)]))
        }
    })
    data.forEach(el => elementsId.push(el.id === 1 ? {id: el.id, title: `${el.initial}`} : {id: el.id, title: `${el.initial}, Member Lv. ${el.level}`}))
    data.forEach(el => {
        let element = document.getElementsByClassName('bonus-options')[0].cloneNode()
        element.value = el.id
        element.innerHTML = el.initial
        document.getElementsByClassName('bonus-selector')[0].appendChild(element)

        let element2 = document.getElementsByClassName('parent-options')[0].cloneNode()
        element2.value = el.id
        element2.innerHTML = el.initial
        document.getElementsByClassName('member-parent-selector')[0].appendChild(element2)
        
        if (el.id !== 1){
            let element3 = document.getElementsByClassName('update-options')[0].cloneNode()
            element3.value = el.id
            element3.innerHTML = el.initial
            document.getElementsByClassName('member-update-selector')[0].appendChild(element3)
        }
    })
    let node = document.getElementsByClassName('bonus-options')[0]
    let node2 = document.getElementsByClassName('parent-options')[0]
    let node3 = document.getElementsByClassName('update-options')[0]
    let node4 = document.getElementsByClassName('parent-udpate-options')[0]
    
    node.parentNode.removeChild(node)
    node2.parentNode.removeChild(node2)
    node3.parentNode.removeChild(node3)
    Highcharts.chart('container', {
        chart: {
            height: 600,
            inverted: true
        },
      
        title: {
            text: 'MLM Challenge'
        },
      
        accessibility: {
            point: {
                descriptionFormatter: function (point) {
                    var nodeName = point.toNode.name,
                        nodeId = point.toNode.id,
                        nodeDesc = nodeName === nodeId ? nodeName : nodeName + ', ' + nodeId,
                        parentDesc = point.fromNode.id;
                    return point.index + '. ' + nodeDesc + ', reports to ' + parentDesc + '.';
                }
            }
        },
      
        series: [{
            type: 'organization',
            name: 'MLM Challenge',
            keys: ['from', 'to'],
            data: elements,
            levels: [{
                level: 0,
                color: 'silver',
                dataLabels: {
                    color: 'black'
                },
                height: 25
            }, {
                level: 1,
                color: 'yellow',
                dataLabels: {
                    color: 'black'
                },
                height: 0
            }, {
                level: 2,
                color: '#980104'
            }, {
                level: 4,
                color: '#359154'
            }],
            nodes: elementsId, 
            colorByPoint: false,
            color: '#007ad0',
            dataLabels: {
                color: 'white'
            },
            borderColor: 'white',
            nodeWidth: 65
        }],
        tooltip: {
            outside: true
        },
        exporting: {
            allowHTML: true,
            sourceWidth: 800,
            sourceHeight: 600
        }
      
      });
})

