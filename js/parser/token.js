define(function() {

  class Token {
    /**
     * type should be one of the valid token types list below, and value is an
     * optional value that can carry any extra information necessary for a given
     * token type. (e.g. the matched string for an identifier)
     */
    constructor(type, value, pred) {
      this.type = type;
      this.value = value;
      this.pred = pred;
    }
  };

  [
    'EOF', // we augment the tokens with EOF, to indicate the end of the input.
    'LAMBDA',
    'LPAREN',
    'RPAREN',
    'CLPAREN',
    'CRPAREN',
    'LCID',
    'DOT', 
    'COMMA',
    
    'APP',

    'LET',
    'DEFINE',
    'IN',

    'REC',

    'INT',

    'TRUE',
    'FALSE',

    'NOT',

    'AND',
    'OR',
    'PLUS',
    'SUB',
    'MULT',
    'DIV',
    'LTE',
    
    'IF',
    'THEN',
    'ELSE',

    'SET',
    'CHANGE',
    'TO',
    'PROP',
    'DEP',
    'DEREF',
    //'SEQ',
  ].forEach(token => Token[token] = token);

  return Token;
});
