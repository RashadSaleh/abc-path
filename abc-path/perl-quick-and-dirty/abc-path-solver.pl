#!/usr/bin/perl

use strict;
use warnings;

use Carp;

use Text::Table;

my $ABCP_VERDICT_NO = 0;
my $ABCP_VERDICT_MAYBE = 1;
my $ABCP_VERDICT_YES = 2;

my $BOARD_LEN = 5;
my $BOARD_LEN_LIM = $BOARD_LEN - 1;

package Games::ABC_Path::Solver::Board;

use Carp;

my @letters = (qw(A B C D E F G H I J K L M N O P Q R S T U V W X Y));

my %letters_map = (map { $letters[$_] => $_ } (0 .. $#letters));

sub get_letter_numeric
{
    my ($self, $letter_ascii) = @_;

    my $index = $letters_map{$letter_ascii};

    if (!defined ($index))
    {
        confess "Unknown letter '$letter_ascii'";
    }

    return $index;
}

sub new
{
    my $class = shift;

    my $self = bless {}, $class;

    $self->_init(@_);

    return $self;
}

sub _layout {
    my $self = shift;

    if (@_) {
        $self->{_layout} = shift;
    }

    return $self->{_layout};
}

sub _init
{
    my ($self, $args) = @_;

    my $layout_string = $args->{layout};

    if (!defined($layout_string))
    {
        $layout_string = '';
    }

    $self->_layout(\$layout_string);

    return;
}

sub _xy_to_idx
{
    my ($self, $x, $y) = @_;

    if (($x < 0) or ($x > $BOARD_LEN_LIM))
    {
        confess "X $x out of range.";
    }

    if (($y < 0) or ($y > $BOARD_LEN_LIM))
    {
        confess "Y $y out of range.";
    }


    return $y * $BOARD_LEN +$x;
}

sub _calc_offset
{
    my ($solver, $letter, $x, $y) = @_;

    if (($letter < 0) or ($letter >= 25))
    {
        confess "Letter $letter out of range.";
    }

    return $letter * ($BOARD_LEN * $BOARD_LEN) + $solver->_xy_to_idx($x,$y);
}

sub get_verdict
{
    my ($solver, $letter, $x, $y) = @_;

    return vec(${$solver->_layout}, $solver->_calc_offset($letter, $x, $y), 2);
}

sub set_verdict
{
    my ($solver, $letter, $x, $y, $verdict) = @_;

    if (not
        (($verdict == $ABCP_VERDICT_NO)
        || ($verdict == $ABCP_VERDICT_MAYBE)
        || ($verdict == $ABCP_VERDICT_YES))
    )
    {
        confess "Invalid verdict $verdict .";
    }

    vec(${$solver->_layout}, $solver->_calc_offset($letter,$x,$y), 2)
        = $verdict;

    return;
}

sub xy_loop
{
    my ($solver, $sub_ref) = (@_);

    foreach my $y (0 .. $BOARD_LEN_LIM)
    {
        foreach my $x (0 .. $BOARD_LEN_LIM)
        {
            $sub_ref->($x,$y);
        }
    }
    return;
}


sub set_verdicts_for_letter_sets
{
    my ($solver, $letter_list, $maybe_list) = @_;

    my %cell_is_maybe =
        (map {; sprintf("%d,%d", @$_) => 1; } @$maybe_list);

    foreach my $letter_ascii (@$letter_list)
    {
        my $letter = $solver->get_letter_numeric($letter_ascii);

        $solver->xy_loop(
            sub {
                my ($x, $y) = @_;

                $solver->set_verdict($letter, $x, $y,
                    ((exists $cell_is_maybe{"$x,$y"})
                        ? $ABCP_VERDICT_MAYBE
                        : $ABCP_VERDICT_NO
                    )
                );
            }
        );
    }

    return;
}

sub set_conclusive_verdict_for_letter
{
    my ($solver, $letter, $xy) = @_;

    my ($l_x, $l_y) = @$xy;

    $solver->xy_loop(sub {
            my ($x, $y) = @_;

            $solver->set_verdict($letter, $x, $y,
                ((($l_x == $x) && ($l_y == $y))
                    ? $ABCP_VERDICT_YES
                    : $ABCP_VERDICT_NO
                )
            );
        }
    );
    OTHER_LETTER:
    foreach my $other_letter (0 .. $#letters)
    {
        if ($other_letter == $letter)
        {
            next OTHER_LETTER;
        }
        $solver->set_verdict($other_letter, $l_x, $l_y, $ABCP_VERDICT_NO);
    }

    return;
}

sub _get_possible_letter_indexes
{
    my ($solver, $x, $y) = @_;

    return 
    [
        grep { $solver->get_verdict($_, $x, $y) != $ABCP_VERDICT_NO }
        (0 .. $#letters)
    ];
}

sub get_possible_letters_for_cell
{
    my ($solver, $x, $y) = @_;

    return [@letters[@{$solver->_get_possible_letter_indexes($x,$y)}]];
}

sub _get_possible_letters_string
{
    my ($solver, $x, $y) = @_;

    return join(',', @{$solver->get_possible_letters_for_cell($x,$y)});
}


sub neighbourhood_and_individuality_inferring
{
    my ($solver) = @_;

    my $num_changed = 1;

    while ($num_changed)
    {
        $num_changed = 0;

        foreach my $letter (0 .. $#letters)
        {
            my @true_cells;

            $solver->xy_loop(sub {
                my @c = @_;

                my $ver = $solver->get_verdict($letter, @c);
                if (    ($ver == $ABCP_VERDICT_YES) 
                    || ($ver == $ABCP_VERDICT_MAYBE))
                {
                    push @true_cells, [@c]; 
                }
            });

            if (@true_cells == 1)
            {
                my $xy = $true_cells[0];
                if ($solver->get_verdict($letter, @$xy) ==
                    $ABCP_VERDICT_MAYBE)
                {
                    $num_changed++;
                    $solver->set_conclusive_verdict_for_letter($letter, $xy);
                    print "For $letters[$letter] only ($xy->[0],$xy->[1]) is possible.\n";
                }
            }

            my @neighbourhood = (map { [(0) x $BOARD_LEN] } (0 .. $BOARD_LEN_LIM));
            
            foreach my $true (@true_cells)
            {
                foreach my $coords
                (
                    grep { $_->[0] >= 0 and $_->[0] < $BOARD_LEN and $_->[1] >= 0 and
                    $_->[1] < $BOARD_LEN }
                    map { [$true->[0] + $_->[0], $true->[1] + $_->[1]] }
                    map { my $d = $_; map { [$_, $d] } (-1 .. 1) }
                    (-1 .. 1)
                )
                {
                    $neighbourhood[$coords->[1]][$coords->[0]] = 1;
                }
            }

            foreach my $neighbour_letter (
                (($letter > 0) ? ($letter-1) : ()),
                (($letter < $#letters) ? ($letter+1) : ()),
            )
            {
                $solver->xy_loop(sub {
                    my ($x, $y) = @_;

                    if ($neighbourhood[$y][$x])
                    {
                        return;
                    }

                    my $existing_verdict =
                        $solver->get_verdict($neighbour_letter, $x, $y);

                    if ($existing_verdict == $ABCP_VERDICT_YES)
                    {
                        die "Mismatched verdict: Should be set to no, but already yes.";
                    }

                    if ($existing_verdict == $ABCP_VERDICT_MAYBE)
                    {
                        $solver->set_verdict($neighbour_letter, $x, $y, $ABCP_VERDICT_NO);
                        print "$letters[$neighbour_letter] cannot be at ($x,$y) due to lack of vicinity from $letters[$letter].\n";
                        $num_changed++;
                    }
                });
            }
        }

        $solver->xy_loop(sub {
            my ($x, $y) = @_;

            my $letters_aref = $solver->_get_possible_letter_indexes($x, $y);

            if (@$letters_aref == 1)
            {
                my $letter = $letters_aref->[0];

                if ($solver->get_verdict($letter, $x, $y) == $ABCP_VERDICT_MAYBE)
                {
                    $num_changed++;
                    $solver->set_conclusive_verdict_for_letter($letter, [$x, $y]);
                    print "The only letter that can be at ($x,$y) is $letters[$letter]. Invalidating it for all other cells.\n";
                }
            }
        });
    }

    return;
}

sub input
{
    my ($solver, $args) = @_;

    if ($args->{version} ne 1)
    {
        die "Can only handle version 1";
    }

    my $layout_string = $args->{layout};

    my $letter_re = qr{[A-Y]};
    my $letter_and_space_re = qr{[ A-Y]};
    my $top_bottom_re = qr/^${letter_re}{7}\n/ms;
    my $inner_re = qr/^${letter_re}${letter_and_space_re}{5}${letter_re}\n/ms;

    if ($layout_string !~ m/\A${top_bottom_re}${inner_re}{5}${top_bottom_re}\z/ms)
    {
        die "Invalid format. Should be Letter{7}\n(Letter{spaces or one letter}{5}Letter){5}\nLetter{7}";
    }

    {
        my %count_letters = (map { $_ => 0 } @letters);
        foreach my $letter ($layout_string =~ m{($letter_re)}g)
        {
            if ($count_letters{$letter}++)
            {
                die "Letter '$letter' encountered twice in the layout.";
            }
        }
    }
# Now let's process the layout string and populate the verdicts table.

    {
        my @major_diagonal_letters;

        $layout_string =~ m{\A(.)};

        push @major_diagonal_letters, $1;

        $layout_string =~ m{(.)\n\z};

        push @major_diagonal_letters, $1;

        $solver->set_verdicts_for_letter_sets(
            \@major_diagonal_letters, 
            [map { [$_,$_] } (0 .. 4)],
        );
    }

    {
        my @minor_diagonal_letters;

        $layout_string =~ m/\A${letter_re}*($letter_re)\n/ms;

        push @minor_diagonal_letters, $1;

        $layout_string =~ m{($letter_re*)\n\z}ms;

        push @minor_diagonal_letters, substr($1,0,1);

        $solver->set_verdicts_for_letter_sets(
            \@minor_diagonal_letters,
            [map { [$_, 4-$_] } (0 .. $BOARD_LEN_LIM)]
        );
    }

    {
        my ($top_row) = ($layout_string =~ m/\A(${letter_re}*)\n/ms);
        my ($bottom_row) = ($layout_string =~ m/(${letter_re}*)\n\z/ms);

        foreach my $x (0 .. $BOARD_LEN_LIM)
        {
            $solver->set_verdicts_for_letter_sets(
                [substr($top_row, $x+1, 1), substr($bottom_row, $x+1, 1),],
                [map { [$x,$_] } (0 .. 4)],
            );
        }
    }

    {
        my @rows = split(/\n/, $layout_string);

        my ($clue_x, $clue_y, $clue_letter);
        foreach my $y (0 .. $BOARD_LEN_LIM)
        {
            my $row = $rows[$y+1];
            $solver->set_verdicts_for_letter_sets(
                [substr($row, 0, 1), substr($row, -1),],
                [map { [$_,$y] } (0 .. $BOARD_LEN_LIM)],
            );

            my $s = substr($row, 1, -1);
            if ($s =~ m{($letter_re)}g)
            {
                my ($l, $x_plus_1) = ($1, pos($s));
                if (defined($clue_letter))
                {
                    confess "Found more than one clue letter in the layout!";
                }
                ($clue_x, $clue_y, $clue_letter) = ($x_plus_1-1, $y, $l);
            }
        }

        if (!defined ($clue_letter))
        {
            confess "Did not find any clue letters inside the layout.";
        }

        $solver->set_conclusive_verdict_for_letter(
            $solver->get_letter_numeric($clue_letter),
            [$clue_x, $clue_y],
        );
    }

    return;
}

sub get_results_text_table
{
    my ($solver) = @_;

    my $tb =
        Text::Table->new(
            \" | ", map {; "X = $_", (\' | '); } (0 .. $BOARD_LEN_LIM)
        );

    foreach my $y (0 .. $BOARD_LEN_LIM)
    {
        $tb->add(
            map 
            { $solver->_get_possible_letters_string($_, $y) } 
            (0 .. $BOARD_LEN_LIM)
        );
    }

    return $tb;
}

package main;

my $solver = Games::ABC_Path::Solver::Board->new;

# Input the board.

my $board_fn = shift(@ARGV);

open my $in_fh, "<", $board_fn
    or die "Cannot open '$board_fn' - $!";

my $first_line = <$in_fh>;
chomp($first_line);

my $magic = 'ABC Path Solver Layout Version 1:';
if ($first_line !~ m{\A\Q$magic\E\s*\z})
{
    die "Can only process files whose first line is '$magic'!";
}

my $layout_string = '';
foreach my $line_idx (1 .. 7)
{
    chomp(my $line = <$in_fh>);
    $layout_string .= "$line\n";
}
close($in_fh);

$solver->input({ layout => $layout_string, version => 1});

# Now let's do a neighbourhood inferring of the board.

$solver->neighbourhood_and_individuality_inferring;

print $solver->get_results_text_table;

=head1 COPYRIGHT AND LICENSE

Copyright (c) 2010 Shlomi Fish

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

=head1 LICENSING EXPLANATION

This is the MIT/X11 Licence. For more information see:

1. L<http://www.opensource.org/licenses/mit-license.php>

2. L<http://en.wikipedia.org/wiki/MIT_License>

=cut
