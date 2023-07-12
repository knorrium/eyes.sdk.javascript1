# frozen_string_literal: true

module Applitools
  class TestResultSummary
    extend Forwardable
    attr_accessor :results, :passed, :unresolved, :failed, :exceptions, :mismatches, :missing, :matches
    attr_accessor :original_test_results
    def_delegators :results, :[], :length

    def initialize(all_test_results)
      @original_test_results = all_test_results
      @results = all_test_results[:results].map {|r| Applitools::TestResults.new(r) }
      @passed = all_test_results[:passed]
      @unresolved = all_test_results[:unresolved]
      @failed = all_test_results[:failed]
      @exceptions = all_test_results[:exceptions]
      @mismatches = all_test_results[:mismatches]
      @missing = all_test_results[:missing]
      @matches = all_test_results[:matches]
    end

    def to_a
      @results
    end

  end
end
