#! /bin/awk -f
BEGIN {
  print "[";
}

{
  print (NR > 1 ? "," : "")$0
}

END {
  print "]";
}
