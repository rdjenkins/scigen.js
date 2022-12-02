Edit the SciGen-format cpblx rules in rules/cpblxrules.in

Then run the following command from root folder to compile them into JSON.

cd rules; perl compile-rules-cpblx.pl; cd ../; node lib/cpblxgen.js
