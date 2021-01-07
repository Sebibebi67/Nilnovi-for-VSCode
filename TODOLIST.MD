format Document ?


errors :

        - Compilation error : double doesn't return anything
        ```
        procedure main() is
                procedure double(x : in out integer) is
                begin
                                x := 2*x;
                end

                x : integer;
                
        begin
                x := 9;
                put(double(x));
        end
        ```

TODAY :

first extension
Highlight