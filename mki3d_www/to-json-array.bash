echo -n '[';
if read name;
then
    echo -n '"'$name'"';
fi;
while read name;
do
    echo ',';
    echo -n '"'$name'"';
done;
echo ']';
