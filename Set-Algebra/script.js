let maxNum = 26;
let currNum = 2;

function AddSet() {

    if (currNum < 26) {

        let charNum = 65 + currNum;
        symbols2.push(alphabet[currNum]);
        currNum++;

        node = document.getElementById('sets');
        node.insertAdjacentHTML('beforeend', `  <div class="input-wrap">
                                                    <h1 class="text">Set &#${charNum} = </h1>
                                                    <div class="input"><input type="set" onkeydown="return checkInputSet(event.key, this.value, this.id)" id="set${charNum - 65}" placeholder="Define set"/></div>
                                                </div>`);
    } else {
        alert('You have reached a limint of available sets');
    }
}

//----------------------------- Check Input ---------------------------

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
    'W', 'X', 'Y', 'Z'
];

const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Shift'];

function checkInputSet(key, value, id) {
    if (value[value.length - 1] == ',' && symbols.indexOf(key) !== -1) {
        return true;
    } else if (symbols.indexOf(value[value.length - 1]) !== -1 && key == ',') {
        return true;
    } else if (symbols.indexOf(key) !== -1) {
        return true;
    } else {
        function backBg() { document.getElementById(id).style.backgroundColor = 'rgba(255, 255, 255, 0)' }
        document.getElementById(id).style.backgroundColor = 'rgba(235, 52, 116, 0.7)';
        document.getElementById(id).style.transition = '0.2s';
        setTimeout(backBg, 600);
        return false;
    }
}


let symbols2 = ['A', 'B', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Shift',
    '-', '+', '/', '!', '(', ')'
];

function checkInputProblem(key, id) {
    if (symbols2.indexOf(key) != -1) {
        return true;
    } else {
        function backBg() { document.getElementById(id).style.backgroundColor = 'rgba(255, 255, 255, 0)' }
        document.getElementById(id).style.backgroundColor = 'rgba(235, 52, 116, 0.7)';
        document.getElementById(id).style.transition = '0.2s';
        setTimeout(backBg, 600);
        return false;
    }
}


let universalSet = new Set();

function Complement(set) {
    return (checkEmpty(set)) ? universalSet : Difference(universalSet, set);
}

function Intersection(set1, set2) {

    let _intersection = new Set();

    set1.forEach(element => {
        if (set2.has(element)) {
            _intersection.add(element);
        }
    });

    return sortSet(_intersection);
}

function Union(set1, set2) {

    let _union = new Set(set1);

    set2.forEach(element => {
        _union.add(element);
    });

    return sortSet(_union);
}

function Difference(set1, set2) {

    let _difference = new Set(set1);

    set2.forEach(element => {

        if (_difference.has(element)) {
            _difference.delete(element);
        }
    });

    return sortSet(_difference);
}

function sortSet(set) {
    let entries = [];
    for (let member of set) {
        entries.push(+member);
    }
    set.clear();
    for (let entry of entries.sort((a, b) => a - b)) {
        set.add(entry);
    }
    return set;
};

const OPERATORS = new Set(['~', '!', '∩', '/', '∪', '+', '-']);
const BRACKETS = new Set(['(', ')']);

let SETSNAMES = new Set();
let SETS = new Array();

function Evaluate(hide = false) {
    if (hide == true) {
        let stepByStep = document.getElementById('stepByStep');
        stepByStep.classList.add('hide');
    }

    FetchSets();

    let formulaString = document.getElementById('formula').value;
    if (formulaString.length < 1) return;

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

                printStep('!', currSet, '', result);
                stack.push(result);
            } else if (element == '∩' || element == '/') {

                let secondSet = stack.pop();
                let firstSet = stack.pop();

                let result = Intersection(firstSet, secondSet);

                printStep('/', firstSet, secondSet, result);
                stack.push(result);
            } else if (element == '∪' || element == '+') {

                let secondSet = stack.pop();
                let firstSet = stack.pop();

                let result = Union(firstSet, secondSet);

                printStep('+', firstSet, secondSet, result);
                stack.push(result);
            } else if (element == '-') {

                let secondSet = stack.pop();
                let firstSet = stack.pop();

                let result = Difference(firstSet, secondSet);

                printStep('-', firstSet, secondSet, result);
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
            SETS.push(sortSet(newSet));
        } else {
            SETS.push(new Set());
        }
    }

    universalSet = sortSet(new Set(universalArray));
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
    return (checkEmpty(unconverted)) ? "Empty Set" : Array.from(unconverted).sort((a, b) => a - b).join(', ');
}

function checkEmpty(set) {
    return (set == undefined || set.size == 0) ? true : false;
}

//----------------------------- Step by Step -------------------------------------------

function stepByStep() {
    if (document.getElementById('formula').value.length < 2) return;

    let stepByStep = document.getElementById('stepByStep');
    let clear = document.getElementById('steps');
    clear.remove();
    step = 0;
    stepByStep.classList.remove('hide');
    stepByStep.insertAdjacentHTML('beforeend', `  <div class="step-by-step" id="steps">
                                                     <h1>Step by step</h1>
                                                   </div>`);
    Evaluate();

    let scrollBody = document.getElementById('container');
    scrollBody.querySelector("#stepByStep").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

let step = 0;

function printStep(operation, firstSet, secondSet, result) {
    step++;

    let str = '';
    let img = "";
    switch (operation) {
        case '!':
            str = `!${setToString(firstSet)} = ${setToString(result)}`;
            img = "Complement.png";
            break;

        case '/':
            str = `${setToString(firstSet)} / ${setToString(secondSet)} = ${setToString(result)}`;
            img = "Intersection.png";
            break;

        case '+':
            str = `${setToString(firstSet)} + ${setToString(secondSet)} = ${setToString(result)}`;
            img = "Union.png";
            break;

        case '-':
            str = `${setToString(firstSet)} - ${setToString(secondSet)} = ${setToString(result)}`;
            img = "Substraction.png";
            break;

        default:
            break;
    }

    let steps = document.getElementById('steps');
    steps.insertAdjacentHTML('beforeend', `  <div class="input-wrap">
                                                <h1 class="text">${step}.  </h1>
                                                <div class="input"><input type="result" value="${str}" readonly/></div>
                                                <img src="${img}">
                                            </div>`);
}

function setToString(set) {
    let str = '';
    if (checkEmpty(set)) {
        return '{ Empty Set }'
    } else {
        for (let num of set) {
            str += ', ' + num;
        }
    }
    return '{ ' + str.slice(2, str.length) + ' }';
}

function Close() {

    let wrapper = document.getElementById("stepByStep")
    setTimeout(() => wrapper.classList.add('hide'), 600);
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
}