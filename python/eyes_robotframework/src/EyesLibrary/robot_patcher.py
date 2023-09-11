from typing import TYPE_CHECKING

from robot.output.output import Output
from robot.result import ExecutionResult

from EyesLibrary.test_results_manager import process_results

if TYPE_CHECKING:
    from robot.result.executionresult import Result


output_close = Output.close


def patched_output_close(self, result):
    # type: (Output, Result) -> None
    close_result = output_close(self, result)
    full_results = ExecutionResult(self._settings.output)
    if process_results(full_results):
        full_results.save(self._settings.output)
    return close_result


Output.close = patched_output_close
