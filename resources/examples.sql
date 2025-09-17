UNITTEST "Str_To_Number should convert string to number correctly with dot as decimal" FOR
FUNCTION Str_To_Number (
        str_            IN VARCHAR2 ) RETURN NUMBER;
USING
    @MockPackage Accrul_Attribute_API
    FUNCTION Get_Attribute_Value (
        attribute_name_ IN VARCHAR2 ) RETURN VARCHAR2
    IS
    BEGIN
        IF (attribute_name_ = 'DEFAULT_X_DECIMAL_SYMBOL') THEN
            RETURN '.'; -- Simulate a dot as the decimal separator
        END IF;
        RETURN NULL;
    END Get_Attribute_Value;

IS
    output_ NUMBER;
BEGIN
    FOR
        | str_            | expected_result |
        | '12345'         | 12345           |
        | '12.345'        | 12.345          | -- Dot is the decimal, so it's kept
        | '12,345'        | 12345           | -- Comma removed as it's not the decimal or a digit
        | '12,345.67'     | 12345.67        | -- Comma removed, dot kept as decimal
        | 'ABC123DEF'     | 123             |
        | '1.234,56'      | 1234.56         | -- Comma removed, dot kept as decimal
        | '-500'          | -500            |
        | '0'             | 0               |
        | ''              | NULL            | -- TO_NUMBER('') returns NULL
        | '100 000.50'    | 100000.50       | -- Space removed, dot kept as decimal
        | '5,000,000'     | 5000000         | -- Commas removed, no decimal
    LOOP
        output_ := Str_To_Number(str_);
        ASSERT output_ = expected_result MESSAGE 'For input "'||str_||'", expected '||expected_result||' but got '||output_;
    END LOOP;
END UNITTEST;