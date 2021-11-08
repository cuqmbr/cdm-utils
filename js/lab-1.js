let maxNum = 26;
let currNum = 2;

function AddSet() {

    if (currNum < 26) {

        let charNum = 65 + currNum;
        currNum++;

        let delBtn = document.querySelectorAll('#delBtn');
        if (delBtn[delBtn.length - 1]) {
            delBtn[delBtn.length - 1].style = "display: none;";
        }

        node = document.getElementById('sets');
        node.insertAdjacentHTML('beforeend', `  <div class="input-wrap">
                                                    <h1 class="text">Set &#${charNum} = </h1>
                                                    <div class="input"><input type="set" id="set${charNum}" placeholder="Define set"/></div>
                                                </div>`);

    } else {
        alert('You have reached a limint of available sets');
    }
}

function DeleteSet(setNum) {

    let setField = document.querySelector(`#setfield${setNum}`);
    setField.remove();
    currNum--;

    let delBtn = document.querySelectorAll('#delBtn');
    if (delBtn[delBtn.length - 1]) {
        delBtn[delBtn.length - 1].style = "display: inline-block;";
    }
}


let universalSet = new Set();

function Complement(set) {

    let _complement = new Set();

    _complement = Difference(universalSet, set);

    return _complement;
}

function Intersection(set1, set2) {

    let _intersection = new Set();

    set1.forEach(element => {
        if (set2.has(element)) {
            _intersection.add(element);
        }
    });

    return _intersection;
}

function Union(set1, set2) {

    let _union = new Set(set1);

    set2.forEach(element => {
        _union.add(element);
    });

    return _union;
}

function Difference(set1, set2) {

    let _difference = new Set(set1);

    set2.forEach(element => {

        if (_difference.has(element)) {
            _difference.delete(element);
        }
    });

    return _difference;
}


const OPERATORS = new Set(['~', '!', '∩', '/', '∪', '+', '-']);
const BRACKETS = new Set(['(', ')']);

let SETSNAMES = new Set();
let SETS = new Array();

function Evaluate() {

    FetchSets();

    let formulaString = document.getElementById('formula').value;

    let charArray = formulaString.split('');
    let RPN_Array = ConvertFormulaCharArrayToRPN(charArray);

    let result = SolveRPNFormula(RPN_Array);

    let readableResult = ConvertToReadableResult(result);


    let resultField = document.getElementById('result');
    resultField.value = readableResult;


    SETSNAMES.clear();
    SETS = new Array();
    universalSet = new Set();
}

function ConvertFormulaCharArrayToRPN(chars) {

    let setsStack = new Array();
    let actionsStack = new Array();

    chars.forEach(element => {

        if (SETSNAMES.has(element)) {

            setsStack.push(GetSetFromIndex(element));
        }

        if (OPERATORS.has(element)) {

            while (GetActionPriority(actionsStack[actionsStack.length - 1]) >= GetActionPriority(element)) {

                let last = actionsStack.pop();

                if (last != '(') {
                    setsStack.push(last);
                } else {
                    break;
                }
            }

            if (actionsStack[0] == undefined || GetActionPriority(actionsStack[actionsStack.length - 1]) < GetActionPriority(element)) {

                actionsStack.push(element);
            }
        }

        if (BRACKETS.has(element)) {

            if (element == '(') {

                actionsStack.push(element);
            }

            if (element == ')') {

                let last = actionsStack.pop();

                while (last != '(') {

                    setsStack.push(last);
                    last = actionsStack.pop();
                }
            }
        }
    });

    while (actionsStack[0] != undefined) {

        setsStack.push(actionsStack.pop());
    }

    return setsStack;
}

function SolveRPNFormula(RPN_Array) {

    let stack = new Array();

    for (let i = 0; i < RPN_Array.length; i++) {
        const element = RPN_Array[i];

        if (OPERATORS.has(element)) {

            if (element == '~' || element == '!') {

                let currSet = stack.pop();

                let result = Complement(currSet);

                stack.push(result);
            } else if (element == '∩' || element == '/') {

                let secondSet = stack.pop();
                let firstSet = stack.pop();

                let result = Intersection(firstSet, secondSet);

                stack.push(result);
            } else if (element == '∪' || element == '+') {

                let secondSet = stack.pop();
                let firstSet = stack.pop();

                let result = Union(firstSet, secondSet);

                stack.push(result);
            } else if (element == '-') {

                let secondSet = stack.pop();
                let firstSet = stack.pop();

                let result = Difference(firstSet, secondSet);

                stack.push(result);
            }
        } else {

            stack.push(element);
        }
    }

    return stack[0];
}



function FetchSets() {

    let universalArray = new Array();

    for (let i = 0; i < currNum; i++) {

        let inputField = document.getElementById(`set${i}`);

        let numArray;
        if (inputField != undefined && inputField.value.length != 0) {
            numArray = inputField.value.split(',');

            numArray.sort();

            let newSet = new Set();

            numArray.forEach(element => {

                newSet.add(+element);
                universalArray.push(+element);
            });

            SETSNAMES.add(String.fromCharCode(65 + i));
            SETS.push(newSet);
        } else {
            console.log('[WARNING] Some of the sets are not defined');
        }
    }

    universalSet = new Set(universalArray);
}




function GetSetFromIndex(index) {

    let unicode = index.charCodeAt(0);

    let num = unicode - 65;

    return SETS[num];
}

function GetActionPriority(action) {

    if (action == '~' || action == '!') {
        return 5;
    } else if (action == '∩' || action == '/') {
        return 4;
    } else if (action == '∪' || action == '+') {
        return 3;
    } else if (action == '-') {
        return 2;
    } else if (action == '(') {
        return 1;
    } else {
        return 0;
    }
}

function ConvertToReadableResult(unconverted) {

    let converted = Array.from(unconverted).sort().join(', ');
    return converted;
}