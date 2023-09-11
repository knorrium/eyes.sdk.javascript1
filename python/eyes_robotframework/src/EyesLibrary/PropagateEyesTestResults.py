from robot.api import SuiteVisitor
from robot.model import TestSuite


class PropagateEyesTestResults(SuiteVisitor):
    """Unused rebot SuiteVisitor, kept for backwards compatibility"""

    def start_suite(self, suite):
        # type: (TestSuite) -> None
        pass
