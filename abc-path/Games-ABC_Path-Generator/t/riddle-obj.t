#!/usr/bin/perl

use strict;
use warnings;

use Test::More tests => 9;
use Test::Differences;

use Games::ABC_Path::Generator;

{
    my $gen = Games::ABC_Path::Generator->new({seed => 1});

    my $riddle = $gen->calc_riddle();

    # TEST
    ok ($riddle, "Riddle was initialized");

    # TEST
    is ($riddle->get_riddle_v1_string(),
        <<'EOF',
YGBJNUT
S     R
D     W
F     V
O A   K
M     I
HEXCQPL
EOF
        "get_riddle_v1_string()",
    );

    # TEST
    eq_or_diff($riddle->get_letters_of_clue({ type => 'col', index => 1, }),
        ['B', 'X',],
        'get_letters_of_clue type col',
    );

    my $layout = $riddle->get_final_layout();

    # TEST
    ok ($layout, "Layout was returned.");

    # TEST
    is ($layout->get_A_pos(), 16, "A_pos is correct.");

    # TEST
    eq_or_diff(
        $layout->get_A_xy(),
        { y => 3, x => 1, },
        "get_A_xy is ok."
    );

    # TEST
    is ($layout->get_letter_at_pos({y => 0, x => 0,}),
        'Y',
        'get_letter_at_pos No. 1',
    );

    # TEST
    is ($layout->get_letter_at_pos({y => 2, x => 1,}),
        'B',
        'get_letter_at_pos No. 2',
    );

    # TEST
    is ($layout->get_letter_at_pos({y => 4, x => 0,}),
        'H',
        'get_letter_at_pos No. 3',
    );
}