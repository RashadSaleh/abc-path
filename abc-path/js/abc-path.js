"use strict";
/*
 * ABC Path Solver and Generator.
 * Copyright by Shlomi Fish, 2011.
 * Released under the MIT/X11 License
 * ( http://en.wikipedia.org/wiki/MIT_License ).
 * */
// Taken from http://stackoverflow.com/questions/202605/repeat-string-javascript
if (!String.prototype.repeat) {
String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 0) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    };
    return result;
};
}
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

function _shlomif_repeat(arr, times) {
    "use strict";

    return (times == 0) ? [] : arr.concat(_shlomif_repeat(arr, times-1));
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
if ( !Array.prototype.forEach ) {

  Array.prototype.forEach = function( callbackfn, thisArg ) {

    var T,
      O = Object(this),
      len = O.length >>> 0,
      k = 0;

    if ( !callbackfn || !callbackfn.call ) {
      throw new TypeError();
    }

    if ( thisArg ) {
      T = thisArg;
    }

    while( k < len ) {

      var Pk = String( k ),
        kPresent = O.hasOwnProperty( Pk ),
        kValue;

      if ( kPresent ) {
        kValue = O[ Pk ];

        callbackfn.call( T, kValue, k, O );
      }

      k++;
    }
  };
}

/*
Class('ABC_Path', {
});
//*/


/*
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
//*/


class ABC_Path {
    get Constants() {
        return class Constants {
            LEN() {
                return 5;
            }
            
            LEN_LIM() {
                return (this.LEN() - 1)
            }
            
            BOARD_SIZE() {
                return this.LEN() * this.LEN()
            }
            
            Y() {
                return 0;
            }
            
            X() {
                return 1;
            }
            
            letters() {
                return [
                    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
                    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
                ];
            }
            
            NUM_CLUES() {
                return 2 + this.LEN() + this.LEN();
            }

            ABCP_MAX_LETTER() {
                return this.letters().length - 1;
            }
        }
    }
    
    get Solver() {
        return class Solver {
            get Base() {
                return class Base extends ABC_Path.Constants {
                    _xy_to_int(xy) {
                        return xy[this.Y()] * this.LEN() + xy[this.X()];
                    }
                    
                    _to_xy(myint) {
                        return [Math.floor(myint / this.LEN()), (myint % this.LEN())];
                    }
                
                    _perl_range(start, end) {
                        var ret = [];

                        for (var i = start; i <= end; i++) {
                            ret.push(i);
                        }

                        return ret;
                    }
                
                    _y_indexes() {
                        return this._perl_range(0,this.LEN_LIM());
                    }
                
                    _x_indexes() {
                        return this._y_indexes();
                    }
                
                    _x_in_range(x) {
                        return ((x >= 0) && (x < this.LEN()));
                    }
                
                    _y_in_range(y) {
                        return this._x_in_range(y);
                    }
                
                    _replaceSubstring(s, start, end, replacement) {
                        return s.substring(0, start) + replacement + s.substring(end);
                    }
                }
            }
            ABC_Path.Solver.Move.LastRemainingCellForLetter
            get Move() {
                return class Move extends ABC_Path.Solver.Base {
                    constructor() {
                        this.depth = 0;
                        this.vars = null;
                    }
                    
                    bump() {
                        var ret = this.meta.instantiate();
                        ret.vars = this.vars;
                        ret.setDepth(this.getDepth()+1);
                        return ret;
                    }
                    
                    get LastRemainingCellForLetter() {
                        return class LASTREMAININGCELLFORL
                }
            }
        }
    }
}

/*
Class('ABC_Path.Solver', {
});
//*/


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
        _replaceSubstring: function(s, start, end, replacement) {
            return s.substring(0, start) + replacement + s.substring(end);
        },
    },
});
Class('ABC_Path.Solver.Move', {
    isa: ABC_Path.Solver.Base,
    has: {
        vars: { is: 'rw' },
        depth: { is: 'rw', init: 0, },
    },
    methods: {
        bump: function() {
            var ret = this.meta.instantiate();
            ret.vars = this.vars;
            ret.setDepth(this.getDepth()+1);
            return ret;
        },
    }
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
Class('ABC_Path.Solver.Move.TryingLetterForCell', {
    isa: ABC_Path.Solver.Move
});
Class('ABC_Path.Solver.Move.ResultsInAnError', {
    isa: ABC_Path.Solver.Move
});
Class('ABC_Path.Solver.Move.ResultsInASuccess', {
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
                    ret[l[i]] = parseInt(i);
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
            return this.getSuccessful_layouts().slice(0);
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
            var board = this;

            var cell_is_maybe = new Array();

            maybe_list.forEach(function (m) {
                cell_is_maybe[board._xy_to_s(m[0], m[1])] = true;
            });

            letter_list.forEach(function (l) {
                var letter = board._get_letter_numeric(l);

                board._xy_loop(function(x,y) {
                    board._set_verdict(letter, x, y,
                        (
                             (board._xy_to_s(x,y) in cell_is_maybe)
                                ? board.ABCP_VERDICT_MAYBE()
                                : board.ABCP_VERDICT_NO()
                        )
                    );
                });
            });

            return;
        },
        _set_conclusive_verdict_for_letter: function(letter, xy_) {
            var xy = xy_.slice(0);
            var l_x = xy.shift();
            var l_y = xy.shift();

            var board = this;
            this._xy_loop(function (x,y) {
                board._set_verdict(letter, x, y,
                    (((l_x == x) && (l_y == y))
                        ? board.ABCP_VERDICT_YES()
                        : board.ABCP_VERDICT_NO()
                    )
                    );
            });

            var _l_indexes = this._l_indexes();
            for (var i in _l_indexes) {
                var other_letter = _l_indexes[i];
                if (other_letter != letter)
                {
                    this._set_verdict(other_letter, l_x, l_y, board.ABCP_VERDICT_NO());
                }
            }
            return;
        },
        _get_possible_letter_indexes: function(x, y) {
            var board = this;
            return board._l_indexes().filter(function (l) {
                return (board._get_verdict(l, x, y) != board.ABCP_VERDICT_NO());
            });
        },
        get_possible_letters_for_cell: function(x, y) {
            var board = this;
            return this._get_possible_letter_indexes(x,y).map(function (l) {
                return board.letters()[l];
            });
        },
        _get_possible_letters_string: function(x, y) {
            return this.get_possible_letters_for_cell(x,y).join(',');
        },
        _infer_letters: function() {

            var board = this;
            try {
                board._l_indexes().forEach(function (letter) {

                    var true_cells = [];

                    board._xy_loop(function(cx, cy) {
                        var ver = board._get_verdict(letter, cx, cy);

                        if ((ver == board.ABCP_VERDICT_YES())
                            || (ver == board.ABCP_VERDICT_MAYBE())) {
                                true_cells.push([cx,cy]);
                            }
                    });

                    if (true_cells.length == 0) {
                        board.setError(['letter', letter]);
                        throw 'letter_error';
                    }
                    else if (true_cells.length == 1) {
                        var xy = true_cells[0];
                        if (board._get_verdict(letter, xy[0], xy[1]) ==
                            board.ABCP_VERDICT_MAYBE()) {
                                board._set_conclusive_verdict_for_letter(letter, xy);
                                board._add_move(
                                        new ABC_Path.Solver.Move.LastRemainingCellForLetter({
                                            vars: { letter: letter, coords: xy },
                                        })
                                        );
                            }
                    }

                var neighbourhood = board._y_indexes().map(function(i) {
                    return _shlomif_repeat([false], board.LEN());
                });

                for (var t_i in true_cells) {
                    var true_cell = true_cells[t_i];

                    for (var dx = -1; dx <= 1; dx++) {
                        for (var dy = -1; dy <= 1; dy++) {
                            var cx = true_cell[0] + dx;
                            var cy = true_cell[1] + dy;

                            if (board._x_in_range(cx) && board._y_in_range(cy))
                            {
                                neighbourhood[cy][cx] = true;
                            }
                        }
                    }
                }

                var neighbour_letters = [];
                if (letter > 0)
                {
                    neighbour_letters.push(letter-1);
                }
                if (letter < board.ABCP_MAX_LETTER())
                {
                    neighbour_letters.push(letter+1);
                }

                neighbour_letters.forEach(function (neighbour_letter) {
                    board._xy_loop(function (x, y) {
                        if (neighbourhood[y][x]) {
                            return;
                        }

                        var existing_verdict = board._get_verdict(neighbour_letter, x, y);

                        if (existing_verdict == board.ABCP_VERDICT_YES()) {
                            board.setError(['mismatched_verdict', x, y]);
                            return;
                        }

                        if (existing_verdict == board.ABCP_VERDICT_MAYBE()) {
                            board._set_verdict(neighbour_letter, x, y, board.ABCP_VERDICT_NO());

                            board._add_move(
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
                });
                });
            }
            catch (err)
            {
                if (err != 'letter_error')
                {
                    throw err;
                }
            }

            return;
        },
        _infer_cells: function() {
            var board = this;
            board._xy_loop(function (x, y) {
                var letters_aref = board._get_possible_letter_indexes(x, y);

                if (letters_aref.length == 0) {
                    board.setError(['cell', [x, y]]);
                    return;
                }
                else if (letters_aref.length == 1) {
                    var letter = letters_aref[0];

                    if (board._get_verdict(letter, x, y) == board.ABCP_VERDICT_MAYBE()) {
                        board._set_conclusive_verdict_for_letter(letter, [x, y]);

                        board._add_move(
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
        _inference_iteration: function() {
            this._infer_letters();
            this._infer_cells();
            return this._flush_changed();
        },
        _neighbourhood_and_individuality_inferring: function() {
            var num_changed = 0;

            var iter_changed;
            while (iter_changed = this._inference_iteration())
            {
                if (this.getError())
                {
                    return;
                }
                num_changed += iter_changed;
            }

            return num_changed;
        },
        _clone: function() {
            var ret = new ABC_Path.Solver.Board({});
            ret.setLayout(this.getLayout().slice(0));
            return ret;
        },
        get_moves: function() {
            return this.getMoves().slice(0);
        },
        // Performs the actual solution. Should be called after input.
        solve: function() {
            var board = this;

            this._neighbourhood_and_individuality_inferring();

            if (this.getError())
            {
                return this.getError();
            }
            var min_coords;
            var min_options = [];

            board._xy_loop(function (x,y) {
                var letters_aref = board._get_possible_letter_indexes(x, y);

                if (letters_aref.length == 0) {
                    board.setError(['cell', [$x, $y]]);
                }
                else if (letters_aref.length > 1) {
                    if ((!min_coords) ||
                        (letters_aref.length < min_options.length)) {
                        min_options = letters_aref.slice(0);
                        min_coords = [x,y];
                    }
                }

                return;
            });

            if (board.getError())
            {
                return board.getError();
            }

            if (min_coords)
            {
                var x = min_coords.shift();
                var y = min_coords.shift();
                // We have at least one multiple rank cell. Let's recurse there:
                min_options.forEach(function (letter) {
                    var recurse_solver = board._clone();

                    board._add_move(
                        new ABC_Path.Solver.Move.TryingLetterForCell({
                            vars: { letter: letter, coords: [x, y], },
                        })
                    );

                    recurse_solver._set_conclusive_verdict_for_letter(
                        letter, [x,y]
                    );

                    recurse_solver.solve();

                    recurse_solver.get_moves().forEach(function (move) {
                        board._add_move(move.bump());
                    });

                    if (recurse_solver.getError())
                    {
                        board._add_move(
                            new ABC_Path.Solver.Move.ResultsInAnError({
                                vars: {
                                    letter: letter,
                                    coords: [x,y],
                                },
                            })
                        );
                    }
                    else
                    {
                        board._add_move(
                            new ABC_Path.Solver.Move.ResultsInASuccess({
                                vars: { letter: letter, coords: [x,y],},
                            })
                        );

                        recurse_solver.getSuccessful_layouts().forEach(function (e) {
                            board.getSuccessful_layouts().push(e);
                        });
                    }
                });
                var count = board.getSuccessful_layouts().length;
                if (! count)
                {
                    return ['all_options_bad'];
                }
                else if (count == 1)
                {
                    return ['success'];
                }
                else
                {
                    return ['success_multiple'];
                }
            }
            else
            {
                board.setSuccessful_layouts([board._clone()]);
                return ['success'];
            }
        },
        input_from_clues: function(clues) {
            var board = this;
            board._set_conclusive_verdict_for_letter(board._get_letter_numeric(clues.clue_letter),
                [clues.clue_letter_x, clues.clue_letter_y]
            );

            board._set_verdicts_for_letter_sets(clues.major_diagonal,
                board._y_indexes().map(function(y) { return [y,y]; })
            );
            board._set_verdicts_for_letter_sets(clues.minor_diagonal,
                board._y_indexes().map(function(y) { return [y,4-y]; })
            );
            board._x_indexes().forEach(function (x) {
                board._set_verdicts_for_letter_sets(clues.columns[x],
                    board._y_indexes().map(function(y) { return [x,y]; })
                );
            });
            board._y_indexes().forEach(function (y) {
                board._set_verdicts_for_letter_sets(clues.rows[y],
                    board._x_indexes().map(function(x) { return [x,y]; })
                );
            });
            return;
        },
        _get_results_text_table: function() {
            var board = this;
            var render_row = function(cols) {
                return "| " + cols.map(function(s) {
                    return s.length == 1 ? ("  " + s + "  ") : s;
                }).join(" | ") + " |\n";
            };
            return [board._x_indexes().map(function (x) {
                return "X = " + (x+1); })].concat(
                    board._y_indexes().map(function(y) {
                        return board._x_indexes().map(function (x) {
                            return board._get_possible_letters_string(x,y);
                        })
                    })).map(render_row).join('');
        },
        get_successes_text_tables: function() {
            return this.get_successful_layouts().map(function (l) {
                return l._get_results_text_table();
            });
        },
    },
});
Class('ABC_Path.Generator', {
});
Class('ABC_Path.Generator.FinalLayoutObj', {
    isa: ABC_Path.Solver.Base,
    has: {
        s: { is: ro },
    },
    methods: {
        get_A_pos: function() {
            return this.getS().indexOf(String.fromCharCode(1));
        },
        get_A_xy: function() {
            var xy = this._to_xy(this.get_A_pos());
            return {y : xy[this.Y()], x: xy[this.X()], };
        },
        get_cell_contents: function(ind) {
            return this.getS().charCodeAt(ind);
        },
        get_letter_at_pos: function(mypos) {
            return this.letters()[this.get_cell_contents(
                this._xy_to_int([mypos.y, mypos.x])
            ) - 1];
        },
    },
});
Class('ABC_Path.Generator.RiddleObj', {
    isa: ABC_Path.Solver.Base,
    has: {
        solution: { is: ro },
        clues: { is: ro },
        A_pos: { is: ro },
    },
    methods: {
        get_clues_for_input_to_board: function() {
            var that = this;

            // Letter clues.
            var l_clues = that.clues.map(function (clue) {
                return clue.map(function (l_idx) { return that.letters()[l_idx-1];});
            });

            return {
                clue_letter: 'A',
                clue_letter_x: that.A_pos[that.X()],
                clue_letter_y: that.A_pos[that.Y()],
                major_diagonal: l_clues[0],
                minor_diagonal: l_clues[1],
                rows: l_clues.slice(2, 2+5),
                columns: l_clues.slice(2+5, 2+5+5)
            };
        },
    },
});
Class('ABC_Path.Generator.Generator', {
    isa: ABC_Path.Solver.Base,
    has: {
        seed: { is: rw },
        rand: { is: rw, init: function () {
            return new MSRand({ seed : this.seed });
        }
        },
        _get_next_cells_lookup: { is: ro, init: function() {
            var that = this;
            return this._perl_range(0, this.BOARD_SIZE() - 1).map(function (cell) {
                var s = that._to_xy(cell);
                return [].concat.apply([], ([ [-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1] ].map(function(offsets) {
                    var y = s[that.Y()]+offsets[that.Y()];
                    var x = s[that.X()]+offsets[that.X()];
                    return ((that._x_in_range(x) && that._y_in_range(y)) ? [that._xy_to_int([y,x])] : []);
                })));
        });
        },
        },
        _clues_positions: { is: ro, init: function () {
            var that = this;

            var _gen_clue_positions = function (cb) {
                return that._x_indexes().map(cb);
            };

            var _gen_clue_int_positions = function (cb) {
                return _gen_clue_positions(cb).map(function (xy) {
                    return that._xy_to_int(xy);
                });
            };

            var callbacks = [].concat.apply([], [
                    [function (i) { return [i,i]; }],
                    [function (i) { return [i,4-i]; }],
                    that._y_indexes().map(function (y) {
                        return function (x) { return [y,x]; };
                    }),
                    that._x_indexes().map(function (x) {
                        return function (y) { return [y,x]; };
                    })]);

            return callbacks.map(_gen_clue_int_positions);
        }
        },
    },
    methods: {
        _shuffle: function(deck) {
            return this.rand.shuffle(deck);
        },
        _get_next_cells: function(l, init_idx) {
            return this._get_next_cells_lookup[init_idx].filter(function (x)
                {
                    return (l.charCodeAt(x) == 0);
                }
            );
        },
        _add_next_state: function(stack, orig_l, cell_int) {
            var l = this._replaceSubstring(orig_l, cell_int, cell_int+1, String.fromCharCode(1+stack.length));

            stack.push([l, this._shuffle(this._get_next_cells(l, cell_int))]);

            return;
        },
        _get_num_connected: function(l) {

            var connectivity_stack = [l.indexOf('\0')];

            var connected = {};
            var count = 0;

            while (connectivity_stack.length > 0)
            {
                var myint = connectivity_stack.pop();

                if (! (myint in connected))
                {
                    count++;
                    connected[myint] = true;
                    connectivity_stack = connectivity_stack.concat(
                            this._get_next_cells(l, myint).filter(function (x) {
                                return (! (x in connected));
                                }));
                }
            }

            return count;
        },
        calc_final_layout: function() {
            var that = this;

            var dfs_stack = [];
            that._add_next_state(dfs_stack, '\0'.repeat(that.BOARD_SIZE()),
                    that.rand.max_rand(that.BOARD_SIZE()));


            while (dfs_stack.length > 0)
            {
                var dfs_top = dfs_stack[dfs_stack.length - 1];

                var l = dfs_top[0];
                var last_cells = dfs_top[1];

                if (dfs_stack.length == that.BOARD_SIZE()) {
                    return new ABC_Path.Generator.FinalLayoutObj(
                        { s: l }
                    );
                }

                var next_idx = last_cells.shift();

                if ((typeof next_idx == 'undefined')
                        ||
                    (that._get_num_connected(l) !=
                        that.BOARD_SIZE() - dfs_stack.length)) {

                    dfs_stack.pop();
                } else {
                    that._add_next_state(dfs_stack, l, next_idx);
                }
            }
            throw "Not found!";
        },
        calc_riddle: function() {
            var that = this;

            var layout = that.calc_final_layout();

            var A_pos = layout.get_A_pos();

            var init_state = { pos_taken: 0,
                clues: that._perl_range(1, that.NUM_CLUES()).map(function (x) {
                    return { num_remaining: 5 };
                })
            };

            var mark = function (state, pos) {
                state.pos_taken |= (1 << pos);

                var xy = that._to_xy(pos);
                var y = xy[that.Y()];
                var x = xy[that.X()];

                var clues_indexes = [];
                if (y == x)
                {
                    clues_indexes.push(0);
                }
                if (y == (that.LEN()-1-x))
                {
                    clues_indexes.push(1);
                }
                clues_indexes.push(2+y);
                clues_indexes.push((2+5)+x);

                clues_indexes.forEach( function (clue) {
                    state.clues[clue].num_remaining--;
                    return;
                });

                return;
            };

            mark(init_state, A_pos);

            var dfs_stack = [init_state];

            DFS:
            while (dfs_stack.length > 0) {
                var last_state = dfs_stack[dfs_stack.length - 1];

                if (! ('chosen_clue' in last_state)) {
                    var clues = that._perl_range(0, that.NUM_CLUES()-1).map( function (idx) {
                        return [idx, last_state.clues[idx]];
                    }).filter( function (pair) {
                        return (! ('cells' in pair[1]));
                    }).sort( function (a,b) {
                        var aa = a[1].num_remaining ;
                        var bb = b[1].num_remaining ;

                        if (aa < bb)
                    {
                        return -1;
                    }
                        else if (aa > bb)
                    {
                        return 1;
                    }
                        else
                    {
                        return a[0] - b[0];
                    }
                    });

                    if (clues.length == 0) {
                        // Yay! We found a configuration.
                        var handle_clue = function(clue) {
                            var cells = clue.cells;
                            return that._shuffle(cells).map( function (idx) {
                                return layout.get_cell_contents(idx);
                            });
                        };
                        var riddle = new ABC_Path.Generator.RiddleObj({
                            solution: layout,
                            clues: last_state.clues.map(handle_clue),
                            A_pos: that._to_xy(A_pos)
                        });

                        var solver = new ABC_Path.Solver.Board({});
                        solver.input_from_clues(riddle.get_clues_for_input_to_board());
                        solver.solve();

                        if (solver.get_successes_text_tables().length != 1) {
                            // The solution is ambiguous
                            dfs_stack.pop();
                            continue DFS;
                        } else {
                            return riddle;
                        }
                    }

                    // Not enough for the clues there.
                    if (clues[0][1].num_remaining < 2)
                    {
                        dfs_stack.pop();
                        continue DFS;
                    }

                    var clue_idx = clues[0][0];
                    last_state.chosen_clue = clue_idx;

                    var positions = that._clues_positions[clue_idx].filter ( function (x) {
                        return ((last_state.pos_taken & (1 << x)) == 0);
                    });

                    var pairs = [];

                    for (var first_idx = 0; first_idx < positions.length - 1 ; first_idx++) {
                        for (var second_idx = first_idx+1 ; second_idx < positions.length ; second_idx++ ) {
                            pairs.push([positions[first_idx], positions[second_idx]]);
                        }
                    }

                    last_state.pos_pairs = that._shuffle(pairs);
                }

                var chosen_clue = last_state.chosen_clue;
                var next_pair = last_state.pos_pairs.shift();

                if (! next_pair) {
                    dfs_stack.pop();
                    continue DFS;
                }

                var new_state = {};
                new_state.pos_taken = last_state.pos_taken;
                new_state.clues = last_state.clues.map(function (clue) {
                    var copy = {};
                    copy.num_remaining = clue.num_remaining;
                    if (clue.cells) {
                        copy.cells = clue.cells;
                    }
                    return copy;
                });

                next_pair.forEach(function (pos) {
                    mark(new_state, pos);
                    return ;
                });

                new_state.clues[chosen_clue].cells = next_pair.slice(0);

                dfs_stack.push(new_state);
            }

            throw "Not found!";
        },
    }
});
