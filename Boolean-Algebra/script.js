let maxNumOfValues = 26;
let currNumOfValues = 2;

function AddValue() {

    if (currNumOfValues < 26) {

        let charNum = 65 + currNumOfValues;
        currNumOfValues++;
    
        let delBtn = document.querySelectorAll('#delBtn');
        if (delBtn[delBtn.length - 1]) {
            delBtn[delBtn.length - 1].style="display: none;";
        }

        node = document.getElementById('values');
        node.insertAdjacentHTML('beforeend', `  <div class="input-wrap">
                                                    <h1 class="text">Value &#${charNum} = </h1>
                                                    <div class="input"><input type="value" onkeydown="return checkInputValue(event.key, this.value)" id="value${currNumOfValues - 1}" placeholder="e.g. 0 or 1"/></div>
                                                </div>`);

    } else {
        alert('You have reached a limint of available values');
    }        
}

function DeleteValue(valNum) {
    
    let valueField = document.querySelector(`#valueField${valNum}`);
    valueField.remove();
    currNumOfValues--;

    let delBtn = document.querySelectorAll('#delBtn');
    if (delBtn[delBtn.length - 1]) {
        delBtn[delBtn.length - 1].style="display: inline-block;";
    }
}


let VALUES = new Set();
let userValues = new Array();

function FetchValues() {

    userValues = new Array();

    for (let i = 0; i < currNumOfValues; i++) {
        
        let inputField = document.getElementById(`value${i}`);
        let currCharStr = String.fromCharCode(65 + i);
        
        if (inputField.value === '1' || inputField.value === 'true' || inputField.value === 'True'|| inputField.value === 'TRUE' || inputField.value === 't' || inputField.value === 'T') {
            VALUES.add(currCharStr);
            userValues.push([currCharStr, true]);
        } else if (inputField.value === '0' || inputField.value === 'false' || inputField.value === 'False' || inputField.value === 'FALSE' || inputField.value === 'f' || inputField.value === 'F') {
            VALUES.add(currCharStr);
            userValues.push([currCharStr, false]);
        }
    }

    for (const iterator in VALUES) {
        console.log(iterator, VALUES[iterator]);
    }
}

let stepByStep = false;

function Evaluate() {
    
    FetchValues();

    let formulaField = document.getElementById('formula');

    let formulaChraArray = formulaField.value.split('');
    let formulaRPNArray = ConvertCharArrayToRPNArray(formulaChraArray);
    let formulaValuesRPNArray = ConvertLettersToValues(formulaRPNArray);

    let result = SolveRPNFormula(formulaValuesRPNArray);
    let readableResult = convertToReadableResult(result[0]);

    let resultField = document.getElementById('result');
    resultField.value = readableResult;


    let truthTableNode = document.querySelector('#truthTableNode');    
    truthTableNode.classList.add('hide');

    let stepsNode = document.querySelector('#stepsNode');
    let stepsWrapper = document.querySelector('#stepsWrapper');
    
    stepsNode.classList.add('hide');
    stepsWrapper.querySelectorAll('#input-wrap').forEach((element) => {
        element.remove();
    });

    if (stepByStep) {

        stepsNode.classList.remove('hide');

        let stepsActionsArray = StepByStepRPNFormula(formulaRPNArray);
        let stepsResultsArray = result[1];
        
        console.log(stepsActionsArray);
        console.log(stepsResultsArray);
        
        for (let i = 0; i < stepsActionsArray.length; i++) {
            const action = stepsActionsArray[i];
            const result = stepsResultsArray[i];
            
            stepsWrapper.insertAdjacentHTML('beforeend', `  <div class="input-wrap" id="input-wrap">
                                                        <h1 class="text">${i+1}.  </h1>
                                                        <div class="input"><input type="result" id="step1" value="${action} = ${result}" readonly/></div>
                                                    </div>`);
        }

        stepByStep = false;
    }
}

function StepByStep() {

    stepByStep = true;
    Evaluate();
}



function Negation(value) {

    if (value != undefined) { return !value; }
}

function Conjunction(firstValue, secondValue) {

    if (firstValue === true && secondValue === true) {
        return true;
    } else if (firstValue === false && secondValue === true || firstValue === true && secondValue === false || firstValue === false && secondValue === false) {
        return false;
    }
}

function Disjunction(firstValue, secondValue) {

    if (firstValue === true || secondValue === true) {
        return true;
    } else if (firstValue === false && secondValue === false) {
        return false;
    }
}

function Equivalence(firstValue, secondValue) {

    if (firstValue === secondValue) {
        return true;
    } else if (firstValue !== secondValue) {
        return false;
    }
}



function ConvertCharArrayToRPNArray(chars, row = 0) {

    let _values_stack = new Array();
    let _actions_stack = new Array();

    for (let i = 0; i < chars.length; i++) {
        const element = chars[i];
        
        if (TTVALUESNAMES.has(element)) {

            _values_stack.push(GetValueFromRow(element, row));
        } else if (VALUES.has(element)) {

            _values_stack.push(element);
        } else if (OPERATORS.has(element)) {

            while (GetActionPriority(_actions_stack[_actions_stack.length - 1]) >= GetActionPriority(element)) {

                let last = _actions_stack.pop();

                if (last != '(') {
                    _values_stack.push(last);
                } else {
                    break;
                }
            }

            if (_actions_stack[0] == undefined || GetActionPriority(_actions_stack[_actions_stack.length - 1]) < GetActionPriority(element)) {

                _actions_stack.push(element);
            }
        } else if (BRACKETS.has(element)) {

            if (element == '(') {

                _actions_stack.push(element);
            }

            if (element == ')') {

                let _last = _actions_stack.pop();

                while (_last != '(') {

                    _values_stack.push(_last);
                    _last = _actions_stack.pop();
                }
            }
        } else {
            Error('The programm cant solve given formula. Do you typed everything right? Maybe you forgot to define some value?');
        }
    }

    while (_actions_stack[0] != undefined) {

        _values_stack.push(_actions_stack.pop());
    }

    return _values_stack;
}

function ConvertLettersToValues(RPNArray) {

    let valuesRNPArray = new Array();

    RPNArray.forEach(element => {
        
        if (VALUES.has(element)) {
            valuesRNPArray.push(GetValueFromIndex(element));
        } else if (element !== '(' || element !== ')') {
            valuesRNPArray.push(element);
        }
    });

    return valuesRNPArray;
}

function SolveRPNFormula(valuesRPNArray) {

    let stepByStepResults = new Array();

    let _stack =  new Array();

    for (let i = 0; i < valuesRPNArray.length; i++) {
        const element = valuesRPNArray[i]; 

        if (OPERATORS.has(element)) {

            if (element == '!') {
                
                let _currValue = _stack.pop();

                let _result = Negation(_currValue);

                _stack.push(_result);
                stepByStepResults.push(convertToReadableResult(_result));
     
            } else if (element == '*') {
                
                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Conjunction(_firstValue, _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(convertToReadableResult(_result));
                
            } else if (element == '+') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Disjunction(_firstValue, _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(convertToReadableResult(_result));
                
            } else if (element == '>') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Disjunction(Negation(_firstValue), _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(convertToReadableResult(_result));
                
            } else if (element == '=') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Equivalence(_firstValue, _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(convertToReadableResult(_result));
                
            }
        } else {

            _stack.push(element);
        }
    }
    
    return [_stack[0], stepByStepResults];
}

function StepByStepRPNFormula(RPNArray) {

    let stepsArray = new Array();

    let _stack =  new Array();

    for (let i = 0; i < RPNArray.length; i++) {
        const element = RPNArray[i]; 

        if (OPERATORS.has(element)) {

            if (element == '!') {
                
                let _currValue = _stack.pop();

                let _result;

                if (_currValue.length <= 2) {
                    _result = '!'.concat(_currValue);
                } else {
                    _result = '!'.concat('(').concat(_currValue).concat(')');
                }

                _stack.push(_result);
                stepsArray.push([_result]);
     
            } else if (element == '*') {
                
                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result;

                let _firstHasExclemMark = Boolean(_firstValue.split('').filter(x => x === '!').length);
                let _secondHasExclemMark = Boolean(_secondValue.split('').filter(x => x === '!').length);

                if (_firstValue.length <= 2 && _secondValue.length <= 2) {
                    _result = _firstValue.concat('*').concat(_secondValue);
                } else if (_firstValue.length <= 2 && _secondValue.length > 2) {
                    
                    if (_secondHasExclemMark) {

                        _result = _firstValue.concat('*').concat(_secondValue);
                    } else {
                        _result = 
                        _firstValue.concat('*').concat('(').concat(_secondValue).concat(')');
                    }
                } else if (_firstValue.length > 2 && _secondValue.length <= 2) {
                   
                    if (_firstHasExclemMark) {
                        
                        _result = _firstValue.concat('*').concat(_secondValue);
                    } else {
                        
                        _result = '('.concat(_firstValue).concat(')').concat('*').concat(_secondValue);
                    }
                } else if (_firstValue.length > 2 && _secondValue.length > 2) {
                   
                    if (_firstHasExclemMark && _secondHasExclemMark) {
                        
                        _result = _firstValue.concat('*').concat(_secondValue);
                    } if (_firstHasExclemMark && !_secondHasExclemMark) {
                        
                        _result = _firstValue.concat('*').concat('(').concat(_secondValue).concat(')');
                    } else if (!_firstHasExclemMark && _secondHasExclemMark) {
                       
                        _result = '('.concat(_firstValue).concat(')').concat('*').concat(_secondValue);;
                    } else {
                       
                        _result = '('.concat(_firstValue).concat(')').concat('*').concat('(').concat(_secondValue).concat(')');
                    }
                }
                
                _stack.push(_result);
                stepsArray.push([_result]);
                
            } else if (element == '+') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = _firstValue.concat('+').concat(_secondValue);
                
                _stack.push(_result);
                stepsArray.push([_result]);
                
            } else if (element == '>') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = _firstValue.concat('>').concat(_secondValue);
                
                _stack.push(_result);
                stepsArray.push([_result]);
                
            } else if (element == '=') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = _firstValue.concat('=').concat(_secondValue);
                
                _stack.push(_result);
                stepsArray.push([_result]);
            }
        } else {

            _stack.push(element);
        }
    }
    
    return stepsArray;
    // return _stack[0];
}


let TTVALUESNAMES = new Set();
let TTVALUESCONTENTS = new Array();

function BuildTruthTable() {

    let formulaField = document.getElementById('formula')

    formulaField.value.match(/[A-Z]/g).forEach (element => {
        TTVALUESNAMES.add(element);
    })

    TTVALUESNAMES.forEach(element => {
        TTVALUESCONTENTS.push([element]);
    })


    let _numColumns =  TTVALUESNAMES.size;
    let _numRows = Math.pow(2, _numColumns);


    let _rowsContent = new Array();

    for (let r = 0; r < _numRows; r++) {
        
        _rowsContent.push(new Array());

        for (let c = 0; c < _numColumns; c++) {
            
            _rowsContent[r].push(false);
        }
    }


    for (let c = 0; c < _numColumns; c++) {
        
        let _period = Math.pow(2, _numColumns) / Math.pow(2, c+1);

        let _zeros = true;

        for (let r = 0; r < _numRows; r++) {

            if (_zeros) {
                _rowsContent[r][c] = 0;
                TTVALUESCONTENTS[c].push(false);
            }

            if (!_zeros) {
                _rowsContent[r][c] = 1;
                TTVALUESCONTENTS[c].push(true);
            }
            
            if ((r + 1) % _period == 0) {
                _zeros = !_zeros;
            }
        }
    }

    // console.log(_rowsContent);
    // console.log(TTVALUESCONTENTS);
    // console.log(TTVALUESNAMES);


    let _formulaCharArray = formulaField.value.split('');

    let _result = new Array();


    for (let i = 0; i < _numRows; i++) {
        
        let _formula_RPN_Array = ConvertCharArrayToRPNArray(_formulaCharArray, i + 1);
        _result.push(SolveRPNFormula(_formula_RPN_Array));
    }

    ttformula = formulaField.value;
    numRows = _numRows;
    rowsContent = _rowsContent;
    truthTable = _result;

    // console.log(_result);

    let stepsNode = document.querySelector('#stepsNode');
    stepsNode.classList.add('hide');

    let truthTableNode = document.querySelector('#truthTableNode');
    let truthTableWrapper = document.querySelector('#truthTableWrapper');
    
    truthTableNode.classList.remove('hide');
    truthTableWrapper.querySelectorAll('#input-wrap').forEach((element) => {
        element.remove();
    });


    let valueNames = new Array();
    TTVALUESNAMES.forEach(element => { valueNames.push(element) });

    truthTableWrapper.insertAdjacentHTML('beforeend', `  <div class="input-wrap" id="input-wrap">
                                                        <h1 class="text"></h1>
                                                        <div class="input"><input type="result" id="step1" value="${valueNames.join('       ')}        :        Result" readonly/></div>
                                                     </div>`);

    for (let r = 0; r < _numRows; r++) {
        
        let values = '';
        
        for (let i = 0; i < _rowsContent[r].length; i++) {
            values += _rowsContent[r][i] + '        ';
        }
        
        truthTableWrapper.insertAdjacentHTML('beforeend', `  <div class="input-wrap" id="input-wrap">
                                                        <h1 class="text"></h1>
                                                        <div class="input"><input type="result" id="step1" value="${values}:            ${convertToReadableResult(_result[r][0])}" readonly/></div>
                                                    </div>`);
        
        // console.log(` ${_rowsContent[r].join(', ')} : ${_result[r][1][0]}`);
    }

    ClearTruthTableData();
}

function GetValueFromRow(valueIndex, row) {

    for (let i = 0; i < TTVALUESCONTENTS.length; i++) {
        const element = TTVALUESCONTENTS[i];

        if (element[0] == valueIndex) {
            return element[row];
        }       
    }
}

function ClearTruthTableData() {

    TTVALUESNAMES.clear();
    TTVALUESCONTENTS = new Array();
}


const OPERATORS = new Set(['!', '*', '+', '>', '=']);
const BRACKETS = new Set(['(', ')']);

function GetActionPriority(action) {

    if (action == '!') {
        return 5;
    } else if (action == '*') {
        return 4;
    } else if (action == '+' || action == '>' || action == '=') {
        return 3;
    } else if (action == '(') {
        return 2;
    } else {
        return 0;
    }
}

function GetValueFromIndex(valueIndex) {

    for (let i = 0; i < userValues.length; i++) {
        const element = userValues[i];
        
        if (element[0] == valueIndex) {
            return element[1];
        } 
    }
}

function convertToReadableResult(unconverted) {

    return unconverted === true ? '1' : '0';
}

function Error(errMsg) {
    console.log(` [ERROR] ${errMsg}`);
}

//----------------------------- Check Input ---------------------------

const symbols = ['0', '1'];
const specialSymbols = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];

function checkInputValue(key, value) {
    if (value.length < 1 && symbols.indexOf(key) !== -1) {
        return true;
    } else if (value.length == 1 && specialSymbols.indexOf(key) !== -1) {
        return true;
    }
    else {
        return false;
    }
}

const symbols2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
    'W', 'X', 'Y', 'Z', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete',
    '>', '=', '+', '*', '!', '(', ')'
];

function checkInputProblem(key) {
    return (symbols2.indexOf(key) != -1) ? true : false;
}