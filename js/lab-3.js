function GeneratePermutations() {

    let permCount = document.querySelector('#permCount');

    let permBtn = document.querySelector('#permBtn');
    let permProgress = document.querySelector('#permProgress');

    let permGenTime = document.querySelector('#permGenTime');
    let permGenTimeHolder = document.querySelector('#permGenTimeHolder');


    console.clear();

    let cycle = 1;


    let _elCount = permCount.value;

    let a = new Array();

    for (let i = 1; i <= _elCount; i++) {
        a.push(i);   
    }
    

    permBtn.style = "display: none;";
    permProgress.style = "display: flex;";
    permGenTimeHolder.style = "display: none";

    date = new Date();
    let _startTime = date.getTime();

    heapPermutation(a, a.length, a.length);
        
    date = new Date();
    let _endTime = date.getTime();

    permBtn.style = "display: inline-flex;";
    permProgress.style = "display: none;";
    permGenTimeHolder.style = "display: flex";
    

    let _timeElapsed = _endTime - _startTime;

    permGenTime.innerHTML = `${_timeElapsed} milliseconds elapsed`;
    
    
    // JavaScript program to print all permutations using
    // Heap's algorithm

    // Prints the array
    function printArr(a, c) {
        console.log(a, c);  
    }

    // Generating permutation using Heap Algorithm
    function heapPermutation(a,size,n) {
        // if size becomes 1 then prints the obtained
        // permutation
        if (size == 1) {
            printArr(a, cycle);
            cycle++;
        }
    
        for (let i = 0; i < size; i++) {
            heapPermutation(a, size - 1, n);
    
            // if size is odd, swap 0th i.e (first) and
            // (size-1)th i.e (last) element
            if (size % 2 == 1) {
                let temp = a[0];
                a[0] = a[size - 1];
                a[size - 1] = temp;
            }
    
            // If size is even, swap ith
            // and (size-1)th i.e last element
            else {
                let temp = a[i];
                a[i] = a[size - 1];
                a[size - 1] = temp;
            }
        }
    }
}

function factorial(n) {
    let fact = 1;

    for (let i = 1; i <= n; i++) {
        fact *= i;        
    }

    return fact;
}