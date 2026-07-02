# Component code review guidelines

- The goal was to create a SRT component that is equivalent to the MRT component. Preferrably 100% same to same.
- First, Evaluate the srt code and compare to the MRT component to ensure equivalence. 
- Second, read the plan file to understand the choices, assumptions and context for making writing this code
- Evaluate whether this code is equivalent to the MRT component regarding the behaviour, functionality, apis etc.
- Once the code is reviewed, if there are any issues, send it back to the coding agent to fix it.
- This review loop will continue until you are satisfied with the code and it is equivalent to the MRT component.
- After this review step, it will be sent to the testing agent to test the component and ensure it works as expected.