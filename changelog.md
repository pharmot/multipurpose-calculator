# Changelog

## [1.0.5]

### Fixed

- Only require weight (not IBW) for vancomycin maintenance dose range if age between 0 and 18 ([#72])

## [1.0.4]

### Changed

- Add halflife to AUC Calculation Details Output

### Fixed

- Disable suggestion to use Bayesian calculator for initial maintenance dose altogether in HD patients ([#62])
- Fix error in AUC Calculation Details when levels are drawn within the same interval ([#63])

## [1.0.3]

### Changed

- Reword PK dosing disclaimer to consider using if large discrepancy from weight-based dosing ([#60])
- Split webpack entry points and added copy-webpack-plugin for build optimization

## [1.0.2]

### Added
- Age parsing function to util.js module

### Changed

- Keep initial PK dosing disclaimer visible after button is clicked to show section
- Show link to Bayesian calculator instead of weight-based initial maintenance dose if BMI > 30 ([#57])
- Use new parseAge function in form validation for age input

### Fixed

- Switched from popover to tooltip (age help text wasn't working) ([#56])
- Allow non-numbers for age input
- Correct aucNew peak calculation documentation in equations.md ([#58])

## [1.0.1]

### Changed

- For vanco AUC calculation, increase max allowed timespan between peak and trough from 36 to 60 hours so calculations can be done for longer dosing intervals (e.g. q48h) ([#51])


## [1.0.0]

### Added

- Documentation of PK Equations and Calculations ([#40])
- Webpack bundling of all previously external scripts/stylesheets so calculator can be function independently
- Expanded code documentation (jsdoc)
- Output of date and time inputs to calculation details modal when date/time modal is used ([#43])

### Changed

- Return zero for IBW, AdjBW, OverUnder, LBW if age < 18

### Fixed

- Age validation function didn't have access to min and max values from validation config
- Allow any value for number inputs without defined step ([#41])
- Trigger AUC calculation when inputs from modal are copied to calculator ([#42])
- Clear data validation errors when form is reset ([#39])

## [0.4.0] - 2021-10-21

### Added
- Output of inputs, outputs, and calculation steps ([#24])
- Favicon and manifest ([#21])

### Fixed
- Focus on age input when on Reset All ([#37])
- Initial PK Dosing no longer changes if interval is modified after first calculation ([#32])

## [0.3.0] - 2021-10-09

### Added
- Color change of Bayesian calculator alert when BMI > 30 ([#35])
- Hour calculator for AUC dosing (modal) ([#22])
- Confirmation before showing initial PK recommendations ([#35])
- Focus on age input when page loads ([#25])
- Highlight BMI when above 30

### Changed
- Added year to displayDate Util function
- Reposition Bayesian calculator alert higher on page ([#35])
- VMFH Logo as svg instead of png
- Modified monitoring recommendations to clarify when to draw trough ([#31], [#35])

### Fixed
- IVIG calculator weight note aligned correctly ([#20])

## [0.2.2] - 2021-08-19

### Added
- Alert with link to Bayesian calculator for initial PK dosing in kinetic outliers

### Changed
- Updated wording of SSTI/UTI indication to match protocol update

## [0.2.1] - 2021-08-17

### Fixed
- New link to PDF of updated protocol

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
- Reworded indication drop-down ([#16])

### Removed
- Local hosting of libraries (inconsistent functionality across environments)

### Fixed
- Changed input elements to data-form-type="other" so Dashlane would not try to autofill ([#10])

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

[Unreleased]: https://github.com/pharmot/multipurpose-calculator/compare/v1.0.5...HEAD
[1.0.5]: https://github.com/pharmot/multipurpose-calculator/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/pharmot/multipurpose-calculator/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/pharmot/multipurpose-calculator/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/pharmot/multipurpose-calculator/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/pharmot/multipurpose-calculator/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/pharmot/multipurpose-calculator/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/pharmot/multipurpose-calculator/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/pharmot/multipurpose-calculator/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/pharmot/multipurpose-calculator/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.0.2

[#10]: https://github.com/pharmot/multipurpose-calculator/issues/10
[#16]: https://github.com/pharmot/multipurpose-calculator/issues/16
[#20]: https://github.com/pharmot/multipurpose-calculator/issues/20
[#21]: https://github.com/pharmot/multipurpose-calculator/issues/21
[#22]: https://github.com/pharmot/multipurpose-calculator/issues/22
[#24]: https://github.com/pharmot/multipurpose-calculator/issues/24
[#25]: https://github.com/pharmot/multipurpose-calculator/issues/25
[#31]: https://github.com/pharmot/multipurpose-calculator/issues/31
[#32]: https://github.com/pharmot/multipurpose-calculator/issues/32
[#33]: https://github.com/pharmot/multipurpose-calculator/issues/33
[#35]: https://github.com/pharmot/multipurpose-calculator/issues/35
[#37]: https://github.com/pharmot/multipurpose-calculator/issues/37
[#38]: https://github.com/pharmot/multipurpose-calculator/issues/38
[#39]: https://github.com/pharmot/multipurpose-calculator/issues/39
[#40]: https://github.com/pharmot/multipurpose-calculator/issues/40
[#41]: https://github.com/pharmot/multipurpose-calculator/issues/41
[#42]: https://github.com/pharmot/multipurpose-calculator/issues/42
[#43]: https://github.com/pharmot/multipurpose-calculator/issues/43
[#51]: https://github.com/pharmot/multipurpose-calculator/issues/51
[#56]: https://github.com/pharmot/multipurpose-calculator/issues/56
[#57]: https://github.com/pharmot/multipurpose-calculator/issues/57
[#58]: https://github.com/pharmot/multipurpose-calculator/issues/58
[#60]: https://github.com/pharmot/multipurpose-calculator/issues/60
[#62]: https://github.com/pharmot/multipurpose-calculator/issues/62
[#63]: https://github.com/pharmot/multipurpose-calculator/issues/63
[#72]: https://github.com/pharmot/multipurpose-calculator/issues/72