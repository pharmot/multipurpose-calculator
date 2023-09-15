<p align="center"><img src="https://github.com/pharmot/multipurpose-calculator/blob/main/src/icon.svg" width="150"></p>

<div align="center">

# VMFH Multipurpose Calculator

[![Latest Github release](https://img.shields.io/github/release/pharmot/multipurpose-calculator?label=latest%20release&color=%2355a63a&logo=github)](https://github.com/pharmot/multipurpose-calculator/releases/latest)&nbsp;&nbsp;&nbsp;
![GitHub Release Date](https://img.shields.io/github/release-date/pharmot/multipurpose-calculator?color=%2355a63a)&nbsp;&nbsp;&nbsp;
![GitHub commits since latest release](https://img.shields.io/github/commits-since/pharmot/multipurpose-calculator/latest?sort=semver&color=%2327aae1)&nbsp;&nbsp;&nbsp;
![Intranet version](https://img.shields.io/static/v1?label=intranet&message=v1.1.0&color=%2355a63a&logo=windowsxp)&nbsp;&nbsp;&nbsp;
![MIT Licensed](https://img.shields.io/github/license/pharmot/multipurpose-calculator?color=%2355a63a)

## Open the Calculator

[![On-Network](https://img.shields.io/badge/-ON%20NETWORK-%2355a63a?style=flat-square)](http://nwtac1web11.tacoma-wa.catholichealth.net/CHIFH-Rx/MultiCalc/) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[![Off-Network](https://img.shields.io/badge/-OFF%20NETWORK-%2327aae1?style=flat-square)](https://rxcalc.net/multicalc)

---
</div>


# Overview

A dosing and kinetics calculator for pharmacists.  This calculator is intended to be used in conjunction with reasonable clinical judgement and current dosing protocols.

# Features

- Creatinine clearance calculation (Cockroft-Gault for adults, Schwartz for peds)
- Vancomycin dosing
  - Initial protocol dosing
  - Initial pharmacokinetic dosing
  - Single level (trough) revision
  - AUC calculation
  - Two-level pharmacokinetics
- Second dose timing
- IVIG rate calculation and admin instruction generation
- Heparin calcualtor for transferred patients
- Aminoglycoside Extended Interval Dosing
- Custom QT Interval Correction
- PCA Calculator
- KCentra calculation and admin instruction generation
- Standard administration times tool
- Single and double alligation

# Documentation
<ul>
  <li>
    <a href="https://github.com/pharmot/multipurpose-calculator/blob/main/equations.md">Equations and Calculations</a>
  </li>
  <li class="jsdoc-hidden">
    <a class="jsdoc-hidden" href="https://pharmot.github.io/multipurpose-calculator/">Code Documentation</a>
  </li>
</ul>

# Work In Progress

[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/invalid?color=%23E4E669&label=problems)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Ainvalid)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/bug?label=bugs&color=%23D73A4A)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/enhancement?color=%23A2EEEF&label=enhancements)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/update?color=%23F9D0C4&label=updates)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Aupdate)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/question?color=%23D876E3&label=questions)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Aquestion)

# Release Notes

[View full changelog here](changelog.md)

## 1.2.0 - Unreleased

### Added
- Extended interval aminoglycoside calculator
- Vancomycin peak timing calculator
- Corrected QT interval calculator
- Single and double alligation calculator

## [1.1.0] - 2023-01-30

### Added

- AMG Dosing Weight
- Body surface area calculatiom
- Reverse Heparin Calculator
- PCA Dosing Calculator
- Standard Administration Times tool
- KCentra Lot/Exp Calculator

### Changed

- Add Privigen to IVIG options and make default
## [1.0.5] - 2022-11-24

### Fixed

- Pediatric maintnenace dose not being calculated

## [1.0.4] - 2022-10-02

### Changed

- Added halflife to AUC calculation details

### Fixed

- Disabled Bayesian recommendation if HD is selected
- Fixed error displaying details when levels are drawn in the same interval

## [1.0.3] - 2022-05-20

### Changed

- Reword PK dosing disclaimer to consider using if large discrepancy from weight-based dosing
- Split webpack entry points and added copy-webpack-plugin for build optimization

## [1.0.2] - 2022-05-18

### Changed

- Keep initial PK dosing disclaimer visible after button is clicked to show section
- Show link to Bayesian calculator instead of weight-based initial maintenance dose if BMI > 30
  - IDCG Request, May 2022

### Fixed
- Age input in months and/or days

## [1.0.1] - 2022-04-06

### Changed

- Increased allowed time between levels for AUC calculation (e.g. for q48h dosing)

## [1.0.0] - 2021-11-03

### Added

- Documentation of PK equations and calculations
- Output of date and time inputs to calculation details

### Changed

- Can now run independently if hosted on local server (will work if internet is down)

### Fixed

- Trigger AUC calculation when inputs from modal are copied to calculator
- Clear data validation errors when form is reset

## [0.4.0] - 2021-10-21

### New Features
- Output of inputs, outputs, and calculation steps
- Favicon

### Bug Fixes
- Initial PK Dosing no longer changes if interval is modified after first calculation

## [0.3.0] - 2021-10-09

### New Features
- Color change of Bayesian calculator alert when BMI > 30
- Hour calculator for AUC dosing
- Confirmation before showing initial PK recommendations
- Focus on age input when page loads
- Highlight BMI when above 30

### Changes
- Reposition Bayesian calculator alert higher on page
- Modified monitoring recommendations to clarify when to draw trough

## [0.2.2] - 2021-08-19

### New Features
- Alert with link to Bayesian calculator for initial PK dosing in kinetic outliers

### Changes
- Updated wording of SSTI/UTI indication to match protocol update

## [0.2.1] - 2021-08-17

### Changes
- New link to PDF of updated protocol

## [0.2.0] - 2021-07-18
**Release for Go-Live of Vancomycin Dosing Protocol Update** (Aug 2021)

### New Features
- Pediatric vancomycin dosing recommendations
- Pediatric obesity check (using 95th percentile of bmi-for-age CDC data)
- IVIG rate calculator

### Changes
- Initial PK dosing calculation modified to match Epic Kinetics Navigator
- Added dofetilide to list of drugs to always use ABW CrCl
- Reworded indication drop-down


## [0.1.1] - 2021-06-13

### New Features
- Pediatric CrCl calculation using Schwartz equation
- Option to enter age in months and/or days instead of years

### Changes
- Vancomycin initial dosing and monitoring per updated protocol

## [0.1.0] - 2021-06-02

Initial POC Release

### Changes

- Minor bug fixes

## [0.0.3] - 2021-06-02
### New Features
- Second dose timing tab
- Card footer for CrCl explaining which value to use
- Dose adjustment recommendation for HD patients
- Option to adjust the recommended dose/frequency in PK calculations (initial and adjustment)
- Reset button to undo adjustments made to default/recommended dose/frequency
- Table of dose options and resulting troughs for initial PK calculation

### Bug Fixes
- Validation of time inputs

## [0.0.2] - 2021-05-19
### Changes
- Switched order of height and weight inputs to match Epic
- Removed SCr IDMS conversion (per TEAM Core Group)

## 0.0.1 - 2021-04-23
Initial pre-release for distribution among liaisons/vanco calc workgroup

[1.1.0]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v1.1.0
[1.0.5]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v1.0.5
[1.0.4]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v1.0.4
[1.0.3]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v1.0.3
[1.0.2]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v1.0.2
[1.0.1]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v1.0.1
[1.0.0]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v1.0.0
[0.4.0]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.4.0
[0.3.0]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.3.0
[0.2.2]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.2.2
[0.2.1]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.2.1
[0.2.0]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.2.0
[0.1.1]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.1.1
[0.1.0]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.1.0
[0.0.3]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.0.3
[0.0.2]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.0.2
