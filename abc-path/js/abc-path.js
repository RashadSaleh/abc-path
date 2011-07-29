"use strict";
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
        res[i] = fun.call(thisp, t[i], i, t);
    }

    return res;
  };
}
if (!Array.prototype.filter)
{
    Array.prototype.filter = function(fun /*, thisp */)
    {
        "use strict";

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
            if (i in t)
            {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}
Class('ABC_Path', {
});
Class('ABC_Path.Constants', {
    methods: {
        LEN : function () {
            return 5;
        },
        LEN_LIM : function () {
            return (this.LEN()-1);
        },
        BOARD_SIZE : function() {
            return this.LEN() * this.LEN();
        },
        
        Y : function() {
            return 0;
        },

        X : function() {
            return 1;
        },

        letters : function() {
            return [
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
            'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
            ];
        },

        NUM_CLUES : function() {
            return 2 + this.LEN() + this.LEN();
        },

        ABCP_MAX_LETTER : function() {
            return this.letters().length - 1;
        }
    }
});
Class('ABC_Path.Solver', {
});
Class('ABC_Path.Solver.Base', {
    isa: ABC_Path.Constants,
    methods: {
        _xy_to_int: function(xy) {
            return xy[this.Y()] * this.LEN() + xy[this.X()];
        },
        _to_xy: function(myint) {
            return [Math.floor(myint / this.LEN()), (myint % this.LEN())];
        },
        _perl_range: function(start, end) {
            var ret = [];
            
            for (var i = start; i <= end; i++) {
                ret.push(i);
            }

            return ret;
        },
        _y_indexes: function() {
            return this._perl_range(0,this.LEN_LIM());
        },
        _x_indexes: function() {
            return this._y_indexes(); 
        },
        _x_in_range: function(x) {
            return ((x >= 0) && (x < this.LEN()));
        },
        _y_in_range: function(y) {
            return this._x_in_range(y);
        },
    },
});
Class('ABC_Path.Solver.Move', {
    isa: ABC_Path.Solver.Base,
    has: {
        vars: { is: 'rw' }, 
    },
});
Class('ABC_Path.Solver.Move.LastRemainingCellForLetter', {
    isa: ABC_Path.Solver.Move
});
Class('ABC_Path.Solver.Move.LastRemainingLetterForCell', {
    isa: ABC_Path.Solver.Move
});
Class('ABC_Path.Solver.Move.LettersNotInVicinity', {
    isa: ABC_Path.Solver.Move
});
Class('ABC_Path.Solver.Board', {
    isa: ABC_Path.Solver.Base,
    has: {
        letters_map: {
            is: 'ro',
            init: function(){ 
                var ret = {};
                var l = this.letters();
                for (var i in l) {
                    ret[l[i]] = i;
                }
                return ret;
            },
        },
        _iter_changed: {
            is: 'rw',
            init: 0,
        },
        _moves: {
            is: 'rw',
            init: function() { return [];},
        },
        _error: {
            is: 'rw',
            init: undefined,
        },
        _successful_layouts: {
            is: 'rw',
            init: function() { return [];},
        },
        _layout: {
            is: 'rw',
            init: function() { return [];},
        },
    },
    methods: {
        ABCP_VERDICT_NO: function() {
            return 0;
        },
        ABCP_VERDICT_MAYBE: function() {
            return 1;
        },
        ABCP_VERDICT_YES: function() {
            return 2;
        },
        _get_letter_numeric: function(letter_ascii) {
            if (letter_ascii in this.letters_map)
            {
                return this.letters_map[letter_ascii];
            }
            else
            {
                throw "Unknown letter '" + letter_ascii + "'";
                return;
            }
        },
        _inc_changed: function() {
            this.setIter_changed(this.getIter_changed() + 1);
            return;
        },
        _flush_changed: function() {
            
            var ret = this.getIter_changed();

            this.setIter_changed(0);

            return ret;
        },
        _add_move: function(move) {
            this.getMoves().push(move);
            this._inc_changed();
            return;
        },
        get_successful_layouts: function() {
            // slice(0) performs a shallow copy.
            return this.getSuccesful_layouts().slice(0);
        },
        _l_indexes: function() {
            return this._perl_range(0, this.ABCP_MAX_LETTER());
        },
        _calc_offset: function(letter, x, y) {
            return letter * this.BOARD_SIZE() + this._xy_to_int([y,x]);
        },
        _get_verdict: function(letter, x, y) {
            return this.getLayout()[this._calc_offset(letter, x, y)];
        },
        _set_verdict: function(letter, x, y, verdict) {

            if (! ( 
                        ( verdict == this.ABCP_VERDICT_NO() )
                    ||
                    (verdict == this.ABCP_VERDICT_MAYBE())
                    ||
                    (verdict == this.ABCP_VERDICT_YES())
                  )
               )
            {
                throw "Invalid verdict " + verdict + ".";
            }

            this.getLayout()[this._calc_offset(letter, x, y)] = verdict;

            return;
        },
        _xy_loop: function(sub_ref) {

            var y_indexes = this._y_indexes();
            var x_indexes = this._x_indexes();

            for (var y_ in y_indexes)
            {
                var y = y_indexes[y_];
                if (this.getError())
                {
                    return;
                }
                for (var x_ in x_indexes)
                {
                    var x = x_indexes[x_]
                    if (this.getError())
                    {
                        return;
                    }
                    
                    sub_ref(x,y);
                }
            }
            return;
        },
        _xy_to_s: function(x, y) {
            return '' + x + ',' + y;
        },
        _set_verdicts_for_letter_sets: function(letter_list, maybe_list) {

            var cell_is_maybe = new Array();

            for (var maybe_idx in maybe_list) {
                var m = maybe_list[maybe_idx];
                cell_is_maybe[this._xy_to_s(m[0], m[1])] = true;
            }

            for (var letter_ascii_idx in letter_list) {
                var letter = this._get_letter_numeric(
                    letter_list[letter_ascii_idx]
                );

                this._xy_loop(function(x,y) {
                    this._set_verdict(letter, x, y,
                        (
                             (this._xy_to_s(x,y) in cell_is_maybe) 
                                ? this.ABCP_VERDICT_MAYBE()
                                : this.ABCP_VERDICT_NO()
                        )
                    );
                });
            }
            return;
        },
        _set_conclusive_verdict_for_letter: function(letter, xy_) {
            var xy = xy_.slice(0);
            var l_x = xy.shift;
            var l_y = xy.shift;

            this._xy_loop(function (x,y) {
                this._set_verdict(letter, x, y,
                    (((l_x == x) && (l_y == y))
                        ? this.ABCP_VERDICT_YES()
                        : this.ABCP_VERDICT_NO()
                    )
                    );
            });

            var _l_indexes = this._l_indexes();
            for (var i in _l_indexes) {
                var other_letter = _l_indexes[i];
                if (other_letter != letter)
                {
                    this._set_verdict(other_letter, l_x, l_y, ABCP_VERDICT_NO);
                }
            }
            return;
        },
        _get_possible_letter_indexes: function(x, y) {
            return this._l_indexes().filter(function (l) {
                return (this._get_verdict(l, x, y) != this.ABCP_VERDICT_NO());
            });
        },
        get_possible_letters_for_cell: function(x, y) {
            return this._get_possible_letter_indexes(x,y).map(function (l) {
                return this.letters()[l];
            });
        },
        _get_possible_letters_string: function(x, y) {
            return this.get_possible_letters_for_cell(x,y).join(',');
        },
        _infer_letters: function() {
            
            var _l_indexes = this._l_indexes();
            for (var l_i in _l_indexes) {
                var letter = _l_indexes[l_i];

                var true_cells = [];

                this._xy_loop(function(cx, cy) {
                    var ver = this._get_verdict(letter, x, y);

                    if ((ver == this.ABCP_VERDICT_YES())
                         || (ver == this.ABCP_VERDICT_MAYBE())) {
                        true_cells.push([x,y]);
                    }
                });

                if (true_cells.length == 0) {
                    this._error(['letter', letter]);
                }
                else if (true_cells.length == 1) {
                    var xy = true_cells[0];
                    if (this._get_verdict(letter, xy[0], xy[1]) ==
                            this.ABCP_VERDICT_MAYBE()) {
                        this._set_conclusive_verdict_for_letter(letter, xy);
                        this._add_move(
                                new ABC_Path.Solver.Move.LastRemainingCellForLetter({
                                    vars: { letter: letter, coords: xy },
                                })
                        );
                    }
                }

                var neighbourhood = this._y_indexes.map(function(i) {
                    return [false] * this.LEN();
                });

                for (var t_i in true_cells) {
                    var true_cell = true_cells[t_i];

                    for (var dx = -1; dx <= 1; dx++) {
                        for (var dy = -1; dy <= 1; dy++) {
                            var cx = true_cell[0] + dx;
                            var cy = true_clel[1] + dy;
                            
                            if (this._x_in_range(cx) && this._y_in_range(cy))
                            {
                                neighbourhood[cy][cx] = true;
                            }
                        }
                    }
                }
            }

            var neighbour_letters = [];
            if (letter > 0)
            {
                neighbour_letters.push(letter-1);
            }
            if (letter < this.ABCP_MAX_LETTER())
            {
                neighbour_letters.push(letter+1);
            }

            for (var n_l_i in neighbour_letters) {
                neighbour_letter = neighbour_letters[n_l_i];
                
                this._xy_loop(function (x, y) {
                    if (neighbourhood[y][x]) {
                        return;
                    }

                    var existing_verdict = this._get_verdict(neighbour_letter, x, y);

                    if (existing_verdict == this.ABCP_VERDICT_YES()) {
                        this._error(['mismatched_verdict', x, y]);
                        return;
                    }
                    
                    if (existing_verdict == this.ABCP_VERDICT_MAYBE()) {
                        this._set_verdict(neighbour_letter, x, y, this.ABCP_VERDICT_NO());

                        this._add_move(
                            new ABC_Path.Solver.Move.LettersNotInVicinity({
                                vars: {
                                    target: neighbour_letter,
                                    coords: [x,y],
                                    source: letter,
                                },
                            })
                        );
                    }
                });
            }
            
            return;
        },
        _infer_cells: function() {
            this._xy_loop(function (x, y) {
                var letters_aref = this._get_possible_letter_indexes(x, y);

                if (letters_aref.length == 0) {
                    this._error(['cell', [x, y]]);
                    return;
                }
                else if (letters_aref.length == 1) {
                    var letter = letters_aref[0];

                    if (this._get_verdict(letter, x, y) == this.ABCP_VERDICT_MAYBE()) {
                        this._set_conclusive_verdict_for_letter(letter, [x, y]);

                        this._add_move(
                            new ABC_Path.Solver.Move.LastRemainingLetterForCell({
                                    vars: {
                                        coords: [x,y],
                                        letter: letter,
                                    },
                                }
                            )
                        );
                    }
                }
                return;
            });

            return;
        },
    },
});
