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
        node.insertAdjacentHTML('beforeend', `  <div class="field" id="valueField${charNum - 65}">
                                                    <div style="display: flex; align-items: center;">
                                                        <button class="delete is-small mr-1" type="button" onclick="DeleteValue(${charNum - 65})" id="delBtn"></button>
                                                        <label class="label">Value &#${charNum}</label>
                                                    </div>
                                                    <div class="control">
                                                        <input class="input" type="text" placeholder="e.g. 1 or 0" id="value${charNum - 65}">
                                                    </div>
                                                </div>`);
    } else {
        console.log('You have reached a limint of available values');
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


    let stepsActionsArray = StepByStepRPNFormula(formulaRPNArray);
    let stepsResultsArray = result[1];
    
    for (let i = 0; i < stepsActionsArray.length; i++) {
        const action = stepsActionsArray[i];
        const result = stepsResultsArray[i];
        
        console.log(action + ' = ' + result);
    }
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






function ConvertCharArrayToRPNArray(chars) {

    let _values_stack = new Array();
    let _actions_stack = new Array();

    for (let i = 0; i < chars.length; i++) {
        const element = chars[i];
        
        if (VALUES.has(element)) {

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

                if (_firstValue.length <= 2 && _secondValue.length <= 2) {
                    _result = _firstValue.concat('*').concat(_secondValue);
                } else if (_firstValue.length <= 2 && _secondValue.length > 2) {
                    if (Boolean(_secondValue.split('').filter(x => x === '!').length)) {
                        _result = _firstValue.concat('*').concat(_secondValue);
                    } else {
                        _result = _firstValue.concat('*').concat('(').concat(_secondValue).concat(')');
                    }
                } else if (_firstValue.length > 2 && _secondValue.length <= 2) {
                    if (Boolean(_firstValue.split('').filter(x => x === '!').length)) {
                        _result = _firstValue.concat('*').concat(_secondValue);
                    } else {
                        _result = '('.concat(_firstValue).concat(')').concat('*').concat(_secondValue);
                    }
                } else if (_firstValue.length > 2 && _secondValue.length > 2) {
                    if (Boolean(_firstValue.split('').filter(x => x === '!').length) && Boolean(_secondValue.split('').filter(x => x === '!').length)) {
                        _result = _firstValue.concat('*').concat(_secondValue);
                    } if (Boolean(_firstValue.split('').filter(x => x === '!').length) && !Boolean(_secondValue.split('').filter(x => x === '!').length)) {
                        _result = _firstValue.concat('*').concat('(').concat(_secondValue).concat(')');
                    } else if (!Boolean(_firstValue.split('').filter(x => x === '!').length) && Boolean(_secondValue.split('').filter(x => x === '!').length)) {
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





function InputFormulaFotTruthTable() {

    ClearTruthTableData();

    console.log('\n',
        'Write a formula you want to build a truth table for. Examples: (!a>b)+c*d=e',
        '\n'
    );

    let _formulaString = prompt('>>> ');


    if (_formulaString.search('[!,*,+,>,=]') == -1) {
        Error('The programm cant solve given formula. Do you typed everything right?');
    }


    if (_formulaString.match(/[a-z]/g) != null) {
        
        _formulaString.match(/[a-z]/g).forEach (element => {
            TTVALUESNAMES.add(element);
        })
    } else {
        Error('The programm cant solve given formula. Do you typed everything right?');
    }

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
                _rowsContent[r][c] = false;
                TTVALUESCONTENTS[c].push(false);
            }

            if (!_zeros) {
                _rowsContent[r][c] = true;
                TTVALUESCONTENTS[c].push(true);
            }
            
            if ((r + 1) % _period == 0) {
                _zeros = !_zeros;
            }
        }
    }

    // console.log(_rowsContent);
    // console.log(TTVALUESCONTENTS);



    let _formulaCharArray = ConvertFormulaToCharArray(_formulaString);

    let _result = new Array();

    for (let i = 0; i < _numRows; i++) {
        
        let _formula_RPN_Array = ConvertCharArrayToRPNArray(_formulaCharArray, i + 1);
        _result.push(SolveRPNFormula(_formula_RPN_Array));
    }
    // console.log(_result);
    _result.forEach(element => {
        
        if (element == undefined) {
            Error('The programm cant solve given formula. Do you typed everything right?');
        }
    });

    ttformula = _formulaString;
    numRows = _numRows;
    rowsContent = _rowsContent;
    truthTable = _result;


    console.log('');
    for (let r = 0; r < _numRows; r++) {
        
        console.log(` ${_rowsContent[r].join(', ')} : ${_result[r]}`);
    }
    console.log('');

    ClearTruthTableData();

    ReturnToMenu();
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