# Changelog

<!-- ## [Unreleased] -->

## [0.2.0] - 2021-07-18
**Release for Go-Live of Vancomycin Dosing Protocol Update** (Aug 2021)

### Added
- Pediatric vancomycin dosing recommendations
- Pediatric obesity check (using 95th percentile of bmi-for-age CDC data)
- IVIG rate calculator
- Module to optimize admin instruction formatting/spacing for copy-paste to Epic

### Changed
- Initial PK dosing calculation - to match Epic Kinetics Navigator
- Added dofetilide to list of drugs to always use ABW CrCl
- checkValue function can check values where zero is acceptable
- Rearranged single level (trough) adjustment section, leaving suggested doses displayed if user enters test doses
- displayValue can be set to allow negative values
- Reworded indication drop-down [#16](https://github.com/pharmot/multipurpose-calculator/issues/16)

### Removed
- Local hosting of libraries (inconsistent functionality across environments)

### Fixed
- Changed input elements to data-form-type="other" so Dashlane would not try to autofill [#10](https://github.com/pharmot/multipurpose-calculator/issues/10)

## [0.1.1] - 2021-06-13

### Added
- Linter configs and license
- Pediatric CrCl calculation using Schwartz equation
- Option to enter age in months and/or days instead of years

### Changed
- Vancomycin initial dosing and monitoring per updated protocol
- Serve FontAwesome from local directory instead of CDN
- Age input validation

## [0.1.0] - 2021-06-02
Initial POC Release

### Added
- Footer

### Fixed
- Turned debug mode off

## [0.0.3] - 2021-06-02
### Added
- Second dose timing tab
- Card footer for CrCl explaining which value to use
- Dose adjustment recommendation for HD patients
- Query string added debug enable query string
- Option to adjust the recommended dose/frequency in PK calculations (initial and adjustment)
- Reset button to undo adjustments made to default/recommended dose/frequency
- Table of dose options and resulting troughs for initial PK calculation
- FontAwesome stylesheet
- Form validation for time fields
- Expanded documentation

### Changed
- Various input fields: changed type to number, with  min/max/steps

### Fixed
- Validation of time inputs

## [0.0.2] - 2021-05-19
### Changed
- Switched order of height and weight inputs to match Epic

### Removed
- SCr IDMS conversion (as per TEAM Core Group 2021-05-19)

## 0.0.1 - 2021-04-23
- Initial pre-release for distribution among liaisons/vanco calc workgroup

[Unreleased]: https://github.com/pharmot/multipurpose-calculator/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/pharmot/multipurpose-calculator/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/pharmot/multipurpose-calculator/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.0.2
