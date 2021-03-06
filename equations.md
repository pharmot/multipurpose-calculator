# Patient Calculations

## Data Validation
| Parameter | Condition | Value(s) |
|---|---|---|
| Weight | in range | `1` to `300` |
| Height | in range | `60` to `250` |
| Age | in range | `0.25` *(3 months)* to `120` |
| SCr | in range | `0.1` to `20` |
| Sex | one of | `M` `m` `F` `f` |

## Age

### Conversion to Years

- If entered as `#d` → age = d ÷ 365.25
- If entered as `#m` → age = m ÷ 12
- If entered as `#m#d` → age = (m ÷ 12) + (d ÷ 365.25)

### Age Context

*(for determining which fields to show or hide)*
| Condition | Age Context |
| --- | --- |
| If age < 1 year | infant |
| Else if age < 18 years | child |
| Else | adult |

## Body Mass Index

![\mathrm{BMI}=\frac{\mathrm{wt}}{\left(\frac{\mathrm{ht}}{100} \right )^2}](images/eq_bmi.svg)

> **wt** : weight in kg
>
> **ht** : height in cm

## Ideal Body Weight

![\mathrm{IBW_{male}}=50+\left[ 2.3\times\left(\mathrm{ht}-60 \right )\right ]](images/eq_ibw_male.svg)

![\mathrm{IBW_{female}}=45.5+\left[ 2.3\times\left(\mathrm{ht}-60 \right )\right ]](images/eq_ibw_female.svg)

> **ht** : height in inches

## AdjBW

Use ABW if ABW ≤ IBW, otherwise...

![\mathrm{AdjBW}=\left[ 0.4\times \left(\mathrm{ABW}-\mathrm{IBW} \right ) \right ]+\mathrm{IBW}](images/eq_adjbw.svg)

## Percent Over or Under IBW

![\mathrm{OverUnder}=\left(\frac{\mathrm{ABW}}{\mathrm{IBW}}-1 \right )\times 100%](images/eq_overunder.svg)

## Lean Body Weight

![\mathrm{LBW_{male}}=9270\times \left(\frac{\mathrm{ABW}}{6680+\left(216\times \mathrm{BMI} \right )} \right )](images/eq_lbw_male.svg)

![\mathrm{LBW_{female}}=9270\times \left(\frac{\mathrm{ABW}}{8780+\left(244\times \mathrm{BMI} \right )} \right )](images/eq_lbw_female.svg)

## CrCl

### Cockroft-Gault

![\mathrm{CrCl}=\frac{\left(140-\mathrm{age} \right )\times\mathrm{wt}}{\mathrm{SCr}\times 72}](images/eq_crcl_cg.svg) &nbsp;&nbsp;&nbsp;multiply by 0.85 if female

> **wt** : weight in kg

### Schwartz

![\mathrm{CrCl}_{\mathrm{Schwartz}}=\frac{\mathrm{k}\times\mathrm{ht}}{\mathrm{SCr}}](images/eq_crcl_schwartz.svg)

> **ht** : height in cm

| Condition | k value |
| --- | --- |
| if age ≤ 1 and term infant | k = 0.45 |
| else if age ≤ 1 and LBW infant | k = 0.33 |
| else if age ≥ 13 and sex = M | k = 0.7 |
| else | k = 0.55 |

### Protocol CrCl

| Condition | Equation to Use |
| --- | --- |
| If age < 18 | use Schwartz |
| Else if actual weight < IBW | use C-G(actual) |
| Else if overUnder > 30 | use C-G(adjusted) |
| Else | use C-G(ideal) |

# Vancomycin Protocol Dosing

## Configuration

### Maximum Doses

| Parameter | Value |
| --- | --- |
| Max initial TDD (non-HD) | 4500 mg |
| Max MD for HD patient | 2000 mg |
| Max MD for PD patient | 2000 mg |

### Data Validation

| Parameter | Condition | Value(s) |
|---|---|---|
| Dose | in range | `250` to `3000` |
| Frequency | in range | `6` to `48` |
| Level | in range | `3` to `100` |
| Time level drawn after dose | in range | `0` to `36` |

## Loading Dose

**Pediatric (non-obese):**

"Loading dose not recommended in non-obese pediatric patients"

**Pediatric with BMI > 95th percentile for age:**

"Consider loading dose of ` 20 mg/kg × ABW ` mg (BMI ≥ 95th percentile for age)"

**Adults (calculated using ABW)**

| **Adults** | Loading Dose (ABW) | Max LD |
| --- | --- | --- |
| Default | 25 mg/kg | 3 g |
| Sepsis | 25-35 mg/kg | 3 g |
| HD | 25 mg/kg | 3 g |
| PD | 25 mg/kg | 2 g |
| CRRT | 20-25 mg/kg | 3 g |
| SLED | 20-25 mg/kg | 3 g |

## Dose Rounding

**Age ≥ 18:** round to nearest 250 mg

**Age < 18:** round to nearest 25 mg for doses < 250 mg, otherwise round to nearest 250 mg

## Infusion Time

| Dose | Infusion Time (T) |
| --- | --- |
| if dose > 2500 | 3 hours |
| else if dose > 2000 | 2.5 hours |
| else if dose > 1500 | 2 hours |
| else if dose > 1000 | 1.5 hours |
| else | 1 hour |

## Maintenance Dose

| Dialysis | CrCl | Age | Recommendation |
| --- | --- | --- | --- |
| non-HD | (any) | age < 12 | `60-80 mg/kg/day divided q6h` |
| non-HD | (any) | age < 18 | `60-70 mg/kg/day divided q6h` or `60-70 mg/kg/day divided q8h` |

























:pushpin: To Do

# Vancomycin Dosing Equations

## Initial Dosing (Trough Method)

### Volume of Distribution (Vd)

**If BMI < 40:** Vd = ABW x 0.5

**If BMI ≥ 40:** Vd = ABW x 0.7

### Vancomycin Clearance (CL)

*using protocol CrCl*

![\mathrm{CL}=\left [ \left (0.695 \times \mathrm{CrCl} \right ) + 0.05\right ]\times 0.06](images/eq_vcl.svg)

### Elimination Rate Constant (ke)
![ke=\frac{\mathrm{CL}}{\mathrm{V_{d}}}](images/eq_ke.svg)

### Halflife (t½)

![\mathrm{t}_{\frac{1}{2}}=\frac{\ln(2)}{ke}](images/eq_halflife.svg)

### Suggested Interval (τ)

| Condition | Value |
| --- | --- |
| if halflife < 7 | q6h |
| else if halflife < 10 | q8h |
| else if halflife < 15 | q12h |
| else if halflife < 21  | q18h |
| else if halflife < 36 | q24h |
| else | q48h |

### Peak and Trough

Calculate for each possible dose (500-2000 mg):

![\mathrm{C_{max}}=\frac{\mathrm{D}}{\mathrm{T}}\times\frac{1-e^{-ke\times \mathrm{T}}}{\mathrm{V_{d}}\times ke \times \left ( 1-e^{-ke\times \tau } \right )}](images/eq_cmax.svg)

![\mathrm{C_{min}}=\mathrm{C_{max}}\times e^{-ke\: \times\, (\tau - T)}](images/eq_cmin.svg)

Suggested dose is the lowest dose where the predicted trough is greater than or
equal to the low end of goal range and less than or equal to the high end of the
goal range.  Uses the goal from the “monitoring” section above.  If the goal is
an AUC range, uses trough 10-20 for this determination (10-15 for peds).

## Initial Dosing (AUC Method)

### Elimination Rate Constant - Matzke Method (ke)

![ke=(0.00083\times \mathrm{CrCl})+0.0044](images/eq_aucinitial_ke.svg)

### Halflife (t½)

![\mathrm{t}_{\frac{1}{2}}=\frac{\ln(2)}{ke}](images/eq_halflife.svg)

### Vancomycin Clearance (CL)

**Use Matzke method if BMI > 30**

![\mathrm{CL}=\mathrm{V_d}\times\mathrm{ke}](images/eq_aucinitial_vcl_matzke.svg)

**Use Crass method if BMI ≤ 30**

![\mathrm{CL}=\left (9.656-0.078\times \mathrm{age} \right ) - \left(2.009 \times \mathrm{SCr} \right ) + \left ( 1.09 \times \mathrm{sex} \right ) + \left ( 0.04 \times \mathrm{wt}^{0.75} \right )](images/eq_aucinitial_vcl_crass.svg)

*sex = 1 for male, sex = 0 for female*

### Recommended Interval (τ)

![\tau = \mathrm{t}_{\frac{1}{2}}+\mathrm{T}](images/eq_aucinitial_tau.svg)

> **T** : *infusion time*

### Recommended Total Daily Dose (TDD)

![\mathrm{TDD}=\mathrm{CL}\times \mathrm{AUC_{goal}}](images/eq_aucinitial_tdd.svg)

### Recommended Dose (D)

![\mathrm{D}=\mathrm{TDD}\times\frac{\tau}{24}](images/eq_aucinitial_d.svg)

## Dose Revision

### Linear

#### New Dose

![\mathrm{D}_{2}=\left ( \frac{\mathrm{D}_{1}}{\mathrm{C}_{1}}\times\mathrm{C}_{2} \right )+125](images/eq_linear_d2.svg)

> ![\mathrm{C_2}](images/var_c2.svg) : Desired trough = middle of selection range

#### Expected Trough

![\mathrm{C}_{2}=\frac{\mathrm{D}_{2}}{\mathrm{D}_{1}}\times\mathrm{C}_{1}](images/eq_linear_c2.svg)

### Single Level (Trough) Revision

#### Calculated Elimination Rate Constant (ke)
![ke=\frac{\ln\left(\frac{\left[\left(\frac{\mathrm{dose}}{\mathrm{V_{d}}} \right ) + \mathrm{C}_{\mathrm{result}}\right ]}{\mathrm{C_{result}}} \right )}{\left(\tau -\mathrm{T_{trough}} \right )}](images/eq_single_ke.svg)

> ![\mathrm{T_{trough}}](images/var_ttrough.svg) : hours drawn before next infusion

#### Estimated Trough

![\mathrm{C_{est.trough}}=\mathrm{C_{result}}\times e^{-ke\;\times\,\mathrm{T_{trough}}}](images/eq_single_cminest.svg)

#### Estimated Peak

![\mathrm{C_{est.peak}}=\frac{\mathrm{C_{est.trough}}}{e^{-ke\;\times\,\left(\tau -\mathrm{T_{inf}}-\mathrm{T_{trough}} \right )}}](images/eq_single_cmaxest.svg)

#### Halflife (t½)

![\mathrm{t}_{\frac{1}{2}}=\frac{\ln(2)}{ke}](images/eq_halflife.svg)

#### Recommended New Frequency

![\tau_{\mathrm{new}}=\mathrm{T_{inf}}+ \left ( \frac{\ln\frac{\mathrm{C_{trough.goal}}}{\mathrm{C_{peak.goal}}}}{-ke} \right )](images/eq_single_taunew.svg)

*Uses fixed goal peak of 35 mcg/mL*

| ![\tau_{\mathrm{new}}](images/var_taunew.svg) | Round to |
| ------------- | ----------------- |
| < 7 | q6h |
| < 10 | q8h |
| < 16 | q12h |
| < 21 | q18h |
| < 36 | q24h |
| else | q48h |

#### Remainder of calculations

Use calculated ke in same equations/process as [initial PK dosing](#peak-and-trough)

### Two-Level PK

#### Elimination Rate Constant (ke)

![ke=\frac{e^{\frac{\mathrm{C}_1}{\mathrm{C}_2}}}{\mathrm{T}_1-\mathrm{T_2}}](images/eq_twolevel_ke.svg)

#### Remainder of calculations

Use calculated ke in same equations/process as [initial PK dosing](#peak-and-trough)

### AUC Calculation - Current Dose

![ke=\frac{-e^{\frac{\mathrm{C_{max}}}{\mathrm{C_{min}}}}}{\mathrm{T_{min}}-\mathrm{T_{max}}}](images/eq_auc_ke.svg)

![\mathrm{C_{true\,max}}=\frac{\mathrm{C_{max}}}{e^{-ke\;\times\,\left(\mathrm{T_{max}}-\tau \right )}}](images/eq_auc_truemax.svg)

![\mathrm{C_{true\,min}}=\mathrm{C_{min}\times e^{-ke\;\times\,\left(\tau -\mathrm{T_{min}} \right )}}](images/eq_auc_truemin.svg)

![\mathrm{AUC_{inf}}=\left(\mathrm{C_{true\,max}+\mathrm{C_{true\,min}}} \right )\times\frac{\mathrm{T}}{2}](images/eq_auc_aucinf.svg)

![\mathrm{AUC_{elim}}=\frac{\mathrm{C_{true\,max}-\mathrm{C_{true\,min}}}}{ke}](images/eq_auc_aucelim.svg)

![\mathrm{AUC}_{24}=\left(\mathrm{AUC_{inf}} + \mathrm{AUC_{elim}} \right )\times \frac{24}{\tau}](images/eq_auc_auc24.svg)

![\mathrm{V_d}=\frac{\mathrm{dose}}{\mathrm{T}}\times\frac{1-e^{-ke\;\times\,\tau}}{ke\times \left[\mathrm{C_{true\,max}} -\left(\mathrm{C_{true\,min}\times e^{-ke\;\times\,\tau}} \right )\right ]}](images/eq_auc_vd.svg)

### AUC Calculation - New Dose

![\mathrm{AUC}=\mathrm{AUC_{24}}\times\frac{\mathrm{TDD_{new}}}{\mathrm{TDD_{old}}}](images/eq_auc_aucnew.svg)

![\mathrm{C_{max}}=\frac{\mathrm{D}}{\mathrm{T}}\times \frac{1-e^{-ke\times\,\mathrm{T}}}{\mathrm{V_d}\times ke\times\left(1-e^{-ke\;\times\,\tau} \right )}](images/eq_auc_cmax.svg)

> D : new dose

![\mathrm{C_{min}}=\mathrm{C_{max}}\times e^{-ke\;\times\,\left(\tau -\mathrm{T} \right )}](images/eq_auc_cmin.svg)

---

Equation images were created using the [Online LaTeX Equation Editor](https://www.codecogs.com/latex/eqneditor.php)  [![powered by CodeCogs - An Open Source Scientific Library](http://www.codecogs.com/images/poweredbycc.gif)](http://www.codecogs.com)
