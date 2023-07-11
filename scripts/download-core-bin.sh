options=$(getopt -o p:,t:,D: -l platform:,tag:,dir -- "$@")

while [ $# -gt 0 ]
do
  case $1 in
  -p|--platform) 
    platform="$2"
    shift 2 ;;
  -t|--tag)
    tag="$2"
    shift 2 ;;
  -D|--dir)
    dir="$2"
    shift 2 ;;
  (--) 
    shift; break;;
  (-*)
    echo "$0: error - unrecognized option $1" 1>&2; exit 1;;
  (*)
    break;;
  esac
done

if [[ -z "$tag" ]]
then
  tag=$(git --no-pager tag --list 'js/core@*' | tail -n 1)
fi
echo "Downloading from release - '$tag'"

if [ "$platform" == "current" ]
then
  if [[ "$OSTYPE" == "linux-gnu"* ]]
  then
    if [[ -f "/etc/alpine-release" ]]; then platform=alpine
    elif [[ "$(arch)" == "arm64"* ]]; then platform=linux-arm64
    else platform=linux
    fi
  elif [[ "$OSTYPE" == "darwin"* ]]
  then
    platform=macos
  elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]
  then
    platform=win
  else
    platform=unknown
  fi
fi
echo "Downloading for platform - '${platform:-all}'"

echo "Downloading in directory - '${dir:-.}'"

gh release download $tag --clobber --pattern "core-$platform*" --dir "${dir:-.}"