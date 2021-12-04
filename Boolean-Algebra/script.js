//#region Basic Functionallity

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

// Evaluate given formula and display the result
function Evaluate() {
    
    ToggleAll(false);

    FetchValues();

    let formulaField = document.getElementById('formula');

    let formulaChraArray = formulaField.value.split('');
    let formulaRPNArray = ConvertToRPNArray(formulaChraArray);
    let formulaValuesRPNArray = ConvertCharsToValues(formulaRPNArray);

    let result = SolveRPNFormula(formulaValuesRPNArray);
    let readableResult = ConvertToReadableResult(result);

    let resultField = document.getElementById('result');
    resultField.value = readableResult;
}

//#endregion

//#region Boolean Operations

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

//#endregion

//#region Essential Functions

function ConvertToRPNArray(chars) {

    let _values_stack = new Array();
    let _actions_stack = new Array();

    for (let i = 0; i < chars.length; i++) {
        const element = chars[i];
        
        if (!OPERATORS.has(element) && !BRACKETS.has(element)) {

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

function ConvertCharsToValues(RPNArray) {

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
                stepByStepResults.push(ConvertToReadableResult(_result));
     
            } else if (element == '*') {
                
                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Conjunction(_firstValue, _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(ConvertToReadableResult(_result));
                
            } else if (element == '+') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Disjunction(_firstValue, _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(ConvertToReadableResult(_result));
                
            } else if (element == '>') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Disjunction(Negation(_firstValue), _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(ConvertToReadableResult(_result));
                
            } else if (element == '=') {

                let _secondValue = _stack.pop();
                let _firstValue = _stack.pop();
                
                let _result = Equivalence(_firstValue, _secondValue);
                
                _stack.push(_result);
                stepByStepResults.push(ConvertToReadableResult(_result));
                
            }
        } else {

            _stack.push(element);
        }
    }
    
    return _stack[0];
}

//#endregion

//#region Step By Step

// Evalutae formula and display steps in the interface
function StepByStep() {

    FetchValues();

    let formulaField = document.getElementById('formula');

    let formulaChraArray = formulaField.value.split('');
    let formulaRPNArray = ConvertToRPNArray(formulaChraArray);
    let formulaValuesRPNArray = ConvertCharsToValues(formulaRPNArray);

    let result = SolveRPNFormula(formulaValuesRPNArray);
    let readableResult = ConvertToReadableResult(result);

    let resultField = document.getElementById('result');
    resultField.value = readableResult;
    
    let stepsActionsArray = GetCharSteps(formulaRPNArray);
    let stepsResultsArray = GetStepsResults(formulaValuesRPNArray);
        
    // console.log(stepsActionsArray);
    // console.log(stepsResultsArray);
    
    if (stepsResultsArray.length > 0) {

        ToggleAll(false);
        ToggleSteps(true);
    
        for (let i = 0; i < stepsActionsArray.length; i++) {
            const action = stepsActionsArray[i];
            const result = stepsResultsArray[i];
        
                
            stepsWrapper.insertAdjacentHTML('beforeend', `  <div class="input-wrap" id="input-wrap">
                                                        <h1 class="text">${i+1}.  </h1>
                                                        <div class="input"><input type="result" value="${action} = ${result}" readonly/></div>
                                                    </div>`);
        }
    }

    // Get steps in form of characters
    function GetCharSteps(RPNArray) {

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
    
    // Get a result of each step
    function GetStepsResults(valuesRPNArray) {
    
        let stepByStepResults = new Array();
    
        let _stack =  new Array();
    
        for (let i = 0; i < valuesRPNArray.length; i++) {
            const element = valuesRPNArray[i]; 
    
            if (OPERATORS.has(element)) {
    
                if (element == '!') {
                    
                    let _currValue = _stack.pop();
    
                    let _result = Negation(_currValue);
    
                    _stack.push(_result);
                    stepByStepResults.push(ConvertToReadableResult(_result));
         
                } else if (element == '*') {
                    
                    let _secondValue = _stack.pop();
                    let _firstValue = _stack.pop();
                    
                    let _result = Conjunction(_firstValue, _secondValue);
                    
                    _stack.push(_result);
                    stepByStepResults.push(ConvertToReadableResult(_result));
                    
                } else if (element == '+') {
    
                    let _secondValue = _stack.pop();
                    let _firstValue = _stack.pop();
                    
                    let _result = Disjunction(_firstValue, _secondValue);
                    
                    _stack.push(_result);
                    stepByStepResults.push(ConvertToReadableResult(_result));
                    
                } else if (element == '>') {
    
                    let _secondValue = _stack.pop();
                    let _firstValue = _stack.pop();
                    
                    let _result = Disjunction(Negation(_firstValue), _secondValue);
                    
                    _stack.push(_result);
                    stepByStepResults.push(ConvertToReadableResult(_result));
                    
                } else if (element == '=') {
    
                    let _secondValue = _stack.pop();
                    let _firstValue = _stack.pop();
                    
                    let _result = Equivalence(_firstValue, _secondValue);
                    
                    _stack.push(_result);
                    stepByStepResults.push(ConvertToReadableResult(_result));
                    
                }
            } else {
    
                _stack.push(element);
            }
        }
        
        return stepByStepResults;
    }
}

//#endregion

//#region Truth Table

// Generate truth table and display it in the interface
function BuildTruthTable() {

    let header = document.getElementById('formula').value.match(/[A-Z]/g);
    let matrix = GenerateTruthTable();
    DisplayTruthTable(matrix, header);
}

// Generate truth table
function GenerateTruthTable() {

    let formulaField = document.getElementById('formula');
    
    let numColumns = formulaField.value.match(/[A-Z]/g).length;
    let numRows = Math.pow(2, numColumns);

    // Initializing the truthTable
    let truthTable = new Array();

    for (let i = 0; i < numRows; i++) {
        truthTable.push(new Array(numColumns + 1));
    }
    
    for (let c = 0; c < numColumns; c++) {
        
        let period = Math.pow(2, numColumns) / Math.pow(2, c+1);
        let zeros = true;
        
        for (let r = 0; r < numRows; r++) {
            
            if (zeros) {
                truthTable[r][c] = false;
            }
            
            if (!zeros) {
                truthTable[r][c] = true;
            }
                        
            if ((r+1) % period == 0) {
                zeros = !zeros;
            }
        }
    }

    //Evaluate the result for each row
    for (let r = 0; r < truthTable.length; r++) {
        truthTable[r][numColumns] = SolveRPNFormula(ConvertToRPNArray(formulaField.value.split('').map(x => x = ConvertCharsToValues(x, r))));
    }

    //Additional functions
    function ConvertCharsToValues(index, row) {
        return formulaField.value.match(/[A-Z]/g).indexOf(index) != -1 ? truthTable[row][formulaField.value.match(/[A-Z]/g).indexOf(index)] : index;
    }

    return truthTable;
}

// Display truth table in the interface
function DisplayTruthTable(matrix, header) {

        //Display the truth table in the interface
        ToggleAll(false);
        ToggleTruthTable(true);
    
        let truthTableWrapper = document.querySelector('#truthTableWrapper');
    
        truthTableWrapper.insertAdjacentHTML('beforeend', `  <div class="input-wrap" id="input-wrap">
                                                            <h1 class="text"></h1>
                                                            <div class="input"><input type="result" value="${header.join('        ')}    :    Result" readonly/></div>
                                                        </div>`);
    
        for (let r = 0; r < matrix.length; r++) {
    
            let result = matrix[r].pop();
    
            truthTableWrapper.insertAdjacentHTML('beforeend', `  <div class="input-wrap" id="input-wrap">
                                                            <h1 class="text"></h1>
                                                            <div class="input"><input type="result" value="${matrix[r].map(x => x = ConvertToReadableResult(x)).join('        ')}     :       ${ConvertToReadableResult(result)}" readonly/></div>
                                                        </div>`);
        }
}

//#endregion

//#region PDNF & PCNF

function BuildPDNF() {

    DisplayPDNF(GeneratePDNF());
}

function GeneratePDNF() {

    let pdnf = '';
    let mintermCount = 0;

    let header = document.getElementById('formula').value.match(/[A-Z]/g);
    let matrix = GenerateTruthTable();

    for (let r = 0; r < matrix.length; r++) {
        if (matrix[r][matrix[r].length - 1] == 1) {
            
            pdnf += mintermCount != 0 ? '+(' : '(';

            for (let c = 0; c < matrix[r].length - 1; c++) {
                pdnf += matrix[r][c] == 0 ? '!' + header[c] : header[c];
                pdnf += c != matrix[r].length - 2 ? '*' : '';
            }
            
            pdnf += ')';
            mintermCount++;
        }
    }

    return pdnf;
}

function DisplayPDNF(pdnf) {

    ToggleAll(false);
    TogglePDNF(true);

    let Wrapper = document.querySelector('#pdnfWrapper');
    
    Wrapper.insertAdjacentHTML('beforeend', ` <div class="input-wrap" id="input-wrap">
                                                            <h1 class="text"></h1>
                                                            <div class="input"><input type="result" value="${pdnf}" readonly/></div>
                                                        </div>`);
}


function BuildPCNF() {

    DisplayPCNF(GeneratePCNF());
}

function GeneratePCNF() {

    let pcnf = '';
    let maxtermCount = 0;

    let header = document.getElementById('formula').value.match(/[A-Z]/g);
    let matrix = GenerateTruthTable();

    for (let r = 0; r < matrix.length; r++) {
        if (matrix[r][matrix[r].length - 1] == 0) {

            pcnf += maxtermCount != 0 ? '*(' : '(';

            for (let c = 0; c < matrix[r].length - 1; c++) {
                pcnf += matrix[r][c] == 1 ? '!' + header[c] : header[c];
                pcnf += c != matrix[r].length - 2 ? '+' : '';
            }

            pcnf += ')';
            maxtermCount++;
        }
    }

    return pcnf;
}

function DisplayPCNF(pcnf) {

    ToggleAll(false);
    TogglePCNF(true);

    let Wrapper = document.querySelector('#pcnfWrapper');
    
    Wrapper.insertAdjacentHTML('beforeend', ` <div class="input-wrap" id="input-wrap">
                                                            <h1 class="text"></h1>
                                                            <div class="input"><input type="result" value="${pcnf}" readonly/></div>
                                                        </div>`);
}
//#endregion

//#region Additional Functions (Essential too)

function ToggleSteps(show) {

    let Node = document.querySelector('#stepsNode');
    let Wrapper = document.querySelector('#stepsWrapper');
    
    if (show) {
        Node.classList.remove('hide');
        Wrapper.querySelectorAll('#input-wrap').forEach((element) => {
            element.remove();
        });
    } else {
        Node.classList.add('hide');
    }
}

function ToggleTruthTable(show) {

    let Node = document.querySelector('#truthTableNode');
    let Wrapper = document.querySelector('#truthTableWrapper');
    
    if (show) {
        Node.classList.remove('hide');
        Wrapper.querySelectorAll('#input-wrap').forEach((element) => {
            element.remove();
        });
    } else {
        Node.classList.add('hide');
    }
}

function TogglePDNF(show) {

    let Node = document.querySelector('#pdnfNode');
    let Wrapper = document.querySelector('#pdnfWrapper');
    
    if (show) {
        Node.classList.remove('hide');
        Wrapper.querySelectorAll('#input-wrap').forEach((element) => {
            element.remove();
        });
    } else {
        Node.classList.add('hide');
    }
}

function TogglePCNF(show) {

    let Node = document.querySelector('#pcnfNode');
    let Wrapper = document.querySelector('#pcnfWrapper');
    
    if (show) {
        Node.classList.remove('hide');
        Wrapper.querySelectorAll('#input-wrap').forEach((element) => {
            element.remove();
        });
    } else {
        Node.classList.add('hide');
    }
}

function ToggleAll(show) {
    ToggleSteps(show);
    ToggleTruthTable(show);
    TogglePDNF(show);
    TogglePCNF(show);
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

function ConvertToReadableResult(unconverted) {

    return unconverted === true ? '1' : '0';
}

function Error(errMsg) {
    console.log(` [ERROR] ${errMsg}`);
}

//#endregion

//#region Check Input

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

//#endregion