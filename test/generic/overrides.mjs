export const overrides = {
    /// Updating baselines to JS
    // Window
    'check window two times with vg classic': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check window with vg classic': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check window with vg': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check window fully and frame in frame fully with css stitching': {config: {branchName: 'universal-sdk'}}, // was v2
    'check window fully and frame in frame fully with scroll stitching': {config: {branchName: 'universal-sdk'}}, // was v2
    'check window fully and frame in frame fully with vg': {config: {branchName: 'universal-sdk'}}, // was v2
    'check window fully with custom scroll root with css stitching': {config: {branchName: 'universal-sdk'}}, // was v2
    'check window fully on page with sticky header with scroll stitching': {config: {branchName: 'universal-sdk'}}, // different overlap sizes and mechanism
    // Region
    'check region by coordinates in frame with css stitching': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check region by coordinates in frame with scroll stitching': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check overflowed region by coordinates with css stitching': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check overflowed region by coordinates with scroll stitching': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check regions by coordinates in overflowed frame with scroll stitching': {config: {branchName: 'universal-sdk'}}, // was next
    'check region by selector with vg classic': {config: {branchName: 'universal-sdk'}}, // was no-fully-by-default
    'check region by selector fully on page with sticky header with scroll stitching': {config: {branchName: 'universal-sdk'}}, // different overlap sizes and mechanism
    // Frame
    'check frame in frame fully with css stitching': {config: {branchName: 'universal-sdk'}}, // was v1
    'check frame in frame fully with scroll stitching': {config: {branchName: 'universal-sdk'}}, // was v1
    'check frame in frame fully with vg': {config: {branchName: 'universal-sdk'}}, // was v1
    'check frame with vg': {config: {branchName: 'universal-sdk'}}, // was v2 and skipped
    'check frame fully with css stitching': {config: {branchName: 'universal-sdk'}}, // was skipped
    'check frame with css stitching': {config: {branchName: 'universal-sdk'}}, // was v2 and skipped
    'check frame with scroll stitching': {config: {branchName: 'universal-sdk'}}, // was v2
    'check frame after manual switch to frame with vg classic': {config: {branchName: 'universal-sdk'}}, // was no-fully-by-default
    'check frame fully with vg': {config: {branchName: 'universal-sdk'}}, // was skipped
    // Assertion
    'should send floating region by selector with vg': {config: {branchName: 'universal-sdk'}}, // was skipped
    'should send ignore region by selector with vg': {config: {branchName: 'universal-sdk'}}, // was skipped
    'should send floating region by coordinates with vg': {config: {branchName: 'universal-sdk'}}, // was skipped
    'should send multiple accessibility regions by selector with vg': {config: {branchName: 'universal-sdk'}}, // was v1
    //sauce lab has problems with ie and legacy edge
    //'check region by selector on ie': {skip: true, reason: 'sauce lab has problems with ie and legacy edge'},
    //'should send dom on ie': {skip: true, reason: 'sauce lab has problems with ie and legacy edge'},
    //'should set viewport size on edge legacy': {skip: true, reason: 'sauce lab has problems with ie and legacy edge'},
    //'should send dom on edge legacy': {skip: true, reason: 'sauce lab has problems with ie and legacy edge'},
}
