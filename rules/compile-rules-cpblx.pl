#!/usr/bin/env perl

# adapted from rules/compile-rules.pl
# part of scigen.js v0.2.1 https://github.com/davidpomerenke/scigen

use lib '../scigen-perl';
use strict;
use scigen;
use IO::File;
use JSON::XS;
use utf8; # added probably for no reason
use Encode;
binmode STDOUT, ':utf8'; # force UTF-8 on file IO

my $rules_original_dir = 'rules-original/';
my $rules_compiled_dir = 'rules-compiled/';
my @files = ( 'cpblxrules');
my $rules = {};
my $re = undef;
my $json;

# Don't quite understand where the additional UTF-8 encoding is taking place but
# to rescue the data we need to decode it from UTF-8!
sub mydecode {
  return Encode::decode('UTF-8', $_[0]);
}

foreach my $file (@files) {
  scigen::read_rules ( new IO::File ( '<' . $rules_original_dir . $file . '.in'), $rules, $re, 0 );
  open( TEX, '>' . $rules_compiled_dir . $file . '.json');
  $json = mydecode(encode_json $rules);
  print TEX $json;
  close( TEX );
}
