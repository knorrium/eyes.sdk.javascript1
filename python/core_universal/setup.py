import os
from base64 import b64encode
from hashlib import md5
from shutil import copy
from sys import platform

from setuptools import setup
from setuptools.command.build_py import build_py as _build_py
from setuptools.command.sdist import sdist as _sdist

try:
    from urllib.request import HTTPError, Request, urlopen, urlretrieve
except ImportError:
    from urllib import urlretrieve

    from urllib2 import HTTPError, Request, urlopen

    FileNotFoundError = IOError

try:
    from wheel.bdist_wheel import bdist_wheel as _bdist_wheel
except ImportError:
    _bdist_wheel = None


def current_platform_executable():
    if platform == "darwin":
        return "macos"
    elif platform == "win32":
        return "win"
    if platform in ("linux", "linux2"):
        machine = 4  # python2 compatibility
        if os.uname()[machine] == "aarch64":
            return "linux-arm64"
        if os.path.exists("/etc/alpine-release"):
            return "alpine"
        else:
            return "linux"
    else:
        raise Exception("Platform is not supported", platform)


def platform_executable(plat):
    if "macosx" in plat:
        return "macos"
    elif "manylinux" in plat:
        if "aarch64" in plat:
            return "linux-arm64"
        else:
            return "linux"
    elif "musllinux" in plat:
        return "alpine"
    elif "win" in plat:
        return "win"
    else:
        raise ValueError("Unsupported platform", plat)


def b64_encoded_file_md5(file_name):
    try:
        with open(file_name, "rb") as file:
            hasher = md5()
            for chunk in iter(lambda: file.read(4096), b""):
                hasher.update(chunk)
            return b64encode(hasher.digest()).decode("utf-8")
    except FileNotFoundError:
        return None


def b64_encoded_url_md5(url):
    head_request = Request(url)
    head_request.get_method = lambda: "HEAD"
    try:
        response = urlopen(head_request)
        return response.headers.get("Content-MD5", None)
    except HTTPError:
        return None


def download(executable, version, dry_run):
    ext = ".exe" if executable == "win" else ""
    package_bin_name = "bin/core" + ext
    if not dry_run:
        relative_bin_name = "applitools/core_universal/" + package_bin_name
        url_template = (
            "https://github.com/applitools/eyes.sdk.javascript1/releases/download/"
            "js%2Fcore%40{version}/core-{exe}{ext}"
        )
        url = url_template.format(version=version, exe=executable, ext=ext)
        existing_md5 = b64_encoded_file_md5(relative_bin_name)
        if existing_md5 and existing_md5 == b64_encoded_url_md5(url):
            already_downloaded = True
        else:
            already_downloaded = False
        if not already_downloaded:
            try:
                urlretrieve(url, relative_bin_name)
            except BaseException:
                if os.path.isfile(relative_bin_name):
                    os.remove(relative_bin_name)
                raise
            os.chmod(relative_bin_name, 0o755)
    return package_bin_name


def copy_built(build_dir, executable, dry_run):
    ext = ".exe" if executable == "win" else ""
    package_bin_name = "bin/core" + ext
    if not dry_run:
        relative_bin_name = "applitools/core_universal/" + package_bin_name
        built_file_name = "{build_dir}/core-{exe}{ext}".format(
            build_dir=build_dir, exe=executable, ext=ext
        )
        copy(built_file_name, relative_bin_name)
        os.chmod(relative_bin_name, 0o755)
    return package_bin_name


# By default all commands download current platform executable
selected_executable = current_platform_executable()
usdk_build_dir = None
commands = set()


# Prevent executable download and inclusion in source distributions.
@commands.add
class sdist(_sdist):  # noqa
    def finalize_options(self):
        global selected_executable
        selected_executable = None
        return _sdist.finalize_options(self)


if _bdist_wheel:
    # Override bdist_wheel to allow cross-building packages for other platforms by
    # supplying --plat-name argument. Download and include executable matching
    # target platform instead of current one.
    @commands.add
    class bdist_wheel(_bdist_wheel):  # noqa
        user_options = _bdist_wheel.user_options + [
            ("usdk-build-dir=", None, "directory with pre-built Universal SDK bins"),
        ]

        def initialize_options(self):
            _bdist_wheel.initialize_options(self)
            self.usdk_build_dir = None  # noqa

        def finalize_options(self):
            global selected_executable, usdk_build_dir
            _bdist_wheel.finalize_options(self)
            # When plat-name argument is *not* provided to bdist_wheel, wheel is marked
            # with 'any' platform tag because it is also marked as "universal".
            # It has to be universal because it supports py2 and py3, but the executable
            # packaged is not cross-platform, so mark it with current platform's name.
            self.plat_name_supplied = True  # noqa
            selected_executable = platform_executable(self.plat_name)
            usdk_build_dir = self.usdk_build_dir


# Download previously selected executable.
# It is downloaded to the source tree (so editable setup works). Added it to the
# package_data of the distribution to be installed or packed into wheel.
@commands.add
class build_py(_build_py):  # noqa
    def get_data_files(self):
        if selected_executable:
            version = self.distribution.get_version()
            version = ".".join(version.split(".")[:3])  # drop post-build number
            self.mkpath("applitools/core_universal/bin")
            if usdk_build_dir:
                self.announce(
                    "copying %s executable from %s"
                    % (selected_executable, usdk_build_dir),
                    2,
                )
                binary = copy_built(usdk_build_dir, selected_executable, self.dry_run)
            else:
                self.announce("downloading %s executable" % selected_executable, 2)
                binary = download(selected_executable, version, self.dry_run)
            self.package_data[""].append(binary)
        return _build_py.get_data_files(self)


setup(cmdclass={c.__name__: c for c in commands}, package_data={"": []})
