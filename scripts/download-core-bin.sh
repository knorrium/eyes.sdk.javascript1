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
  tag=$(git ls-remote --tags origin 'js/core@*' | tail -n 1 | cut -f 2 | sed -e "s/^refs\/tags\///")
fi
echo "Downloading from release - '$tag'"

if [[ "$platform" == "current" ]]
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

if [[ -z "$platform" ]]; then binary="core-*"
elif [[ "$platform" == "win" ]]; then binary="core-win.exe"
else binary="core-$platform"
fi
echo "Downloading binary - '$binary'"

echo "Downloading in directory - '${dir:-.}'"

gh release download $tag --clobber --pattern "$binary" --dir "${dir:-.}"