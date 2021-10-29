<p align="center"><img src="dist/icon.svg" width="150"></p>

<p align="center" style="padding-bottom: 0.3em;font-size:2em;border-bottom: 1px solid #D8DEE4;">VMFH Multipurpose Calculator</p>
<div align="center">

[![Latest Github release](https://img.shields.io/github/release/pharmot/multipurpose-calculator?label=latest%20release&color=%2355a63a&logo=github)](https://github.com/pharmot/multipurpose-calculator/releases/latest)
![GitHub commits since latest release (by SemVer)](https://img.shields.io/github/commits-since/pharmot/multipurpose-calculator/latest?sort=semver&color=%2327aae1)
![GitHub Release Date](https://img.shields.io/github/release-date/pharmot/multipurpose-calculator?color=%2327aae1)
![Intranet version (pending)](https://img.shields.io/static/v1?label=intranet&message=pending&color=red&logo=windowsxp)



# Quick Links

[![CURRENT VERSION](https://img.shields.io/badge/-CURRENT%20VERSION-%2355a63a?style=flat-square)](https://pharmot.github.io/multipurpose-calculator/) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[![TEST RELEASE](https://img.shields.io/badge/-TEST%20RELEASE%20VERSION-%2327aae1?style=flat-square)](https://pharmot.github.io/multipurpose-calculator-TST/)

---
</div>

<img align="right" src="https://img.shields.io/github/license/pharmot/multipurpose-calculator?color=%2355a63a" alt="MIT Licensed">

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

# Documentation

- [Changelog](changelog.md)
- [Equations and Calculations](docs/equations.md)


# Work In Progress

[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/invalid?color=%23E4E669&label=problems)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Ainvalid)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/bug?label=bugs&color=%23D73A4A)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/enhancement?color=%23A2EEEF&label=enhancements)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/update?color=%23F9D0C4&label=updates)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Aupdate)
[![GitHub issues by-label](https://img.shields.io/github/issues-raw/pharmot/multipurpose-calculator/question?color=%23D876E3&label=questions)](https://github.com/pharmot/multipurpose-calculator/issues?q=is%3Aopen+is%3Aissue+label%3Aquestion)

# Release Notes

## [0.4.0] - 2021-10-21

### New Features
- Output of inputs, outputs, and calculation steps ([#24])
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

[Unreleased]: https://github.com/pharmot/multipurpose-calculator/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/pharmot/multipurpose-calculator/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/pharmot/multipurpose-calculator/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/pharmot/multipurpose-calculator/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/pharmot/multipurpose-calculator/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/pharmot/multipurpose-calculator/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/pharmot/multipurpose-calculator/releases/tag/v0.0.2
