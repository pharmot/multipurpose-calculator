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

$$\mathrm{BMI}=\frac{\mathrm{wt}}{\left(\frac{\mathrm{ht}}{100}\right)^2}$$



> **wt** : weight in kg
>
> **ht** : height in cm

## Ideal Body Weight
$$\mathrm{IBW_{male}}=50+\left[ 2.3\times\left(\mathrm{ht}-60 \right )\right]$$

$$\mathrm{IBW_{female}}=45.5+\left[ 2.3\times\left(\mathrm{ht}-60 \right )\right]$$

> **ht** : height in inches

## AdjBW

Use ABW if ABW ≤ IBW, otherwise...

$$\mathrm{AdjBW}=\left[ 0.4\times \left(\mathrm{ABW}-\mathrm{IBW} \right ) \right ]+\mathrm{IBW}$$

## Percent Over or Under IBW

$$\mathrm{OverUnder}=\left(\frac{\mathrm{ABW}}{\mathrm{IBW}}-1 \right )\times 100%$$

## Lean Body Weight

$$\mathrm{LBW_{male}}=9270\times \left(\frac{\mathrm{ABW}}{6680+\left(216\times \mathrm{BMI} \right )} \right )$$

$$\mathrm{LBW_{female}}=9270\times \left(\frac{\mathrm{ABW}}{8780+\left(244\times \mathrm{BMI} \right )} \right )$$

## Body Surface Area

$$\mathrm{BSA}=\sqrt{\frac{\mathrm{ht}\times\mathrm{wt}}{3600}}$$

> **wt** : weight in kg
>
> **ht** : height in cm


## CrCl

### Cockroft-Gault

$$\mathrm{CrCl}=\frac{\left(140-\mathrm{age} \right )\times\mathrm{wt}}{\mathrm{SCr}\times 72}\ \ \ \mathrm{\ }\times0.85\mathrm{\ if\ female\ }$$

> **wt** : weight in kg

### Schwartz

$$\mathrm{CrCl}_{\mathrm{Schwartz}}=\frac{\mathrm{k}\times\mathrm{ht}}{\mathrm{SCr}}$$

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

<!-- # TPN Calculations

## Daily fluid requirements

| Age | Daily fluid requirement |
| --- | --- |
| Adult < 56 yrs | 35 mL/kg |
| Adult 56-75 yrs | 30 mL/kg |
| Elderly > 75 yrs | 25 mL/kg | -->

# Vancomycin Protocol Dosing

## Configuration

### Maximum Doses

| Parameter                | Value   |
| ------------------------ | ------- |
| Max initial TDD (non-HD) | 4500 mg |
| Max MD for HD patient    | 2000 mg |
| Max MD for PD patient    | 2000 mg |

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

| **Adults**    | Loading Dose (ABW) | Max LD |
| ------------- | ------------------ | ------ |
| Default       | 25 mg/kg           | 3 g    |
| Severe sepsis | 25-35 mg/kg        | 3 g    |
| HD            | 25 mg/kg           | 2 g    |
| PD            | 25 mg/kg           | 2 g    |
| CRRT          | 20-25 mg/kg        | 3 g    |
| SLED          | 20-25 mg/kg        | 3 g    |

## Dose Rounding

**Age ≥ 18:** round to nearest 250 mg

**Age < 18:** round to nearest 25 mg for doses < 250 mg, otherwise round to nearest 250 mg

## Infusion Time

| Dose | Infusion Time ($\mathrm{T}$) |
| ------------------- | --------- |
| if dose > 2500      | 3 hours   |
| else if dose > 2000 | 2.5 hours |
| else if dose > 1500 | 2 hours   |
| else if dose > 1000 | 1.5 hours |
| else                | 1 hour    |

## Maintenance Dose

### Non-Dialysis

| CrCl  | Age         | Recommendation                                                     |
| ----- | ----------- | ------------------------------------------------------------------ |
| (any) | < 12 years  | `60-80 mg/kg/day divided q6h`                                      |
| (any) | < 18 years  | `60-70 mg/kg/day divided q6h` or<br> `60-70 mg/kg/day divided q8h` |
| ≥ 75  | < 40 years  | `15-20 mg/kg q8h`                                                  |
| ≥ 75  | < 80 years  | `15-20 mg/kg q12h`                                                 |
| ≥ 75  | ≥ 80 years  | `10-15 mg/kg q12h`                                                 |
| 50-75 | < 70 years  | `15-20 mg/kg q12h`                                                 |
| 50-75 | 70-79 years | `10-15 mg/kg q12h`                                                 |
| 50-75 | ≥ 80 years  | `15-20 mg/kg q24h`                                                 |
| 35-49 | < 70 years  | `15-20 mg/kg q24h`                                                 |
| 35-49 | 70-79 years | `10-15 mg/kg q24h`                                                 |
| 35-49 | ≥ 80 years  | `10 mg/kg q24h`                                                    |
| 15-34 | < 80 years  | `10 mg/kg q24h`                                                    |
| 15-34 | ≥ 80 years  | `7.5 mg/kg q24h`                                                   |
| < 15  | > 18 years  | `15-20 mg/kg x1`*                                                  |

*Consider checking level in 24-48 hours. Repeat dose when level ≤ 15 (≤ 20 for septic shock/CNS/meningitis)

**Maximum initial maintenance dose**: 4.5 g/day

### Dialysis

**HD**: 10 mg/kg (ABW) after the first HD (max 1.5 g)

**PD**: 10-15 mg/kg when level is < 15 mcg/mL (max 2 g)

**CRRT**: 7.5-10 mg/kg q24h (max 4.5 g/day)

**SLED**: 15-20 mg/kg after each session (max 4.5 g/day)

## Strategy, Target, and Monitoring

```mermaid
flowchart LR
  HDq[Dialysis?]:::gray -->|No| AKIq
  
  AKIq[AKI?]:::gray --> |No| InsightRx:::blue
  InsightRx --> insightInd[CNS/meningitis?]:::gray
  insightInd --> |No| AUC
  insightInd --> |Yes| Trough15

  Trough15 --> outlier[PK Outlier?]:::gray
  AUC --> outlier
  outlier --> |Yes|outlierLevel
  outlierLevel[24-48 hours, then 24-48 hours later]:::green
  outlier --> |No|standardLevel
  standardLevel[First level in 72 hours]:::green
  
  
  AKIq --> |Yes| WB[Weight-based]:::blue --> wtInd
  wtInd[CNS/meningitis?]:::gray
  wtInd --> |No| Trough10
  wtInd --> |Yes| Trough15W

  Trough15[Trough 15-20]:::calc 
  Trough15W[Trough 15-20]:::calc 
  Trough10[Trough 10-15]:::calc 
  AUC[AUC 400-600]:::calc

  Trough10 ---> akiLevel
  Trough15W ---> akiLevel
  akiLevel[First level in ~12 hours]:::green

  HDq ---> |Yes| HDW[Weight-based]:::blue
  HDW --> HDInd[SSTI or UTI?]:::gray
  HDInd --> |No| HD15[Trough 15-20]:::calc
  HDInd --> |Yes| HD10[Trough 10-15]:::calc
  HD15 --> HDType[Type of dialysis?]:::gray
  HD10 --> HDType
  HDType --> |HD| iHD
  HDType --> |PD| PD
  HDType --> |CRRT| CRRT
  HDType --> |SLED| SLED

  iHD[Before every HD, start w/ 2nd after LD]:::green
  PD[q24-48h]:::green
  CRRT[q24h]:::green
  SLED[before each run]:::green


  classDef gray fill:#dedede,stroke:#333,color:black
  classDef calc fill:#FFE5B4,stroke:#FFA500,color:black
  classDef start fill:#a9e695,stroke:#2e691a,color:black
  classDef blue fill:#95dcfa,stroke:#1D7EA8,color:black
  classDef green fill:#d5f291,stroke:#63870e,color:black
  classDef final fill:#ececff,stroke:#c7b5ed,color:black
```


# Vancomycin Dosing Equations

## Initial Dosing (Trough Method)

### Volume of Distribution (Vd)

**If BMI < 40:** Vd = ABW x 0.5

**If BMI ≥ 40:** Vd = ABW x 0.7

### Vancomycin Clearance (CL)

*using protocol CrCl*

$$\mathrm{CL}=\left [ \left (0.695 \times \mathrm{CrCl} \right ) + 0.05\right ]\times 0.06$$

### Elimination Rate Constant ($ke$)
$$ke=\frac{\mathrm{CL}}{\mathrm{V_{d}}}$$

### Halflife ($t_\frac{1}{2}$)

$$\mathrm{t}_{\frac{1}{2}}=\frac{\ln(2)}{ke}$$

### Suggested Interval ($τ$)

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

$$\mathrm{C_{max}}=\frac{\mathrm{D}}{\mathrm{T}}\times\frac{1-e^{-ke\times \mathrm{T}}}{\mathrm{V_{d}}\times ke \times \left ( 1-e^{-ke\times \tau } \right )}$$

$$\mathrm{C_{min}}=\mathrm{C_{max}}\times e^{-ke\: \times\, (\tau - T)}$$

Suggested dose is the lowest dose where the predicted trough is greater than or
equal to the low end of goal range and less than or equal to the high end of the
goal range.  Uses the goal from the “monitoring” section above.  If the goal is
an AUC range, uses trough 10-20 for this determination (10-15 for peds).

## Dose Revision

### Linear

#### New Dose

$$\mathrm{D}_{2}=\left ( \frac{\mathrm{D}_{1}}{\mathrm{C}_{1}}\times\mathrm{C}_{2} \right )+125$$

> $C_2$ : Desired trough = middle of selection range

#### Expected Trough

$$\mathrm{C}_{2}=\frac{\mathrm{D}_{2}}{\mathrm{D}_{1}}\times\mathrm{C}_{1}$$

### Single Level (Trough) Revision (Non-HD)

#### Calculated Elimination Rate Constant (ke)
$$ke=\frac{\ln\left(\frac{\left[\left(\frac{\mathrm{dose}}{\mathrm{V_{d}}} \right ) + \mathrm{C}_{\mathrm{result}}\right ]}{\mathrm{C_{result}}} \right )}{\left(\tau -\mathrm{T_{trough}} \right )}$$

> $\mathrm{T}_\mathrm{trough}$ : hours drawn before next infusion

#### Estimated Trough

$$\mathrm{C_{est.trough}}=\mathrm{C_{result}}\times e^{-ke\;\times\,\mathrm{T_{trough}}}$$

#### Estimated Peak

$$\mathrm{C_{est.peak}}=\frac{\mathrm{C_{est.trough}}}{e^{-ke\;\times\,\left(\tau -\mathrm{T_{inf}}-\mathrm{T_{trough}} \right )}}$$

#### Halflife ($t_\frac{1}{2}$)

$$\mathrm{t}_{\frac{1}{2}}=\frac{\ln(2)}{ke}$$

#### Recommended New Frequency

$$\tau_{\mathrm{new}}=\mathrm{T_{inf}}+ \left ( \frac{\ln\frac{\mathrm{C_{trough.goal}}}{\mathrm{C_{peak.goal}}}}{-ke} \right )$$

*Uses fixed goal peak of 35 mcg/mL*

| $\tau_\mathrm{new}$ | Round to |
| ------------- | ----------------- |
| < 7 | q6h |
| < 10 | q8h |
| < 16 | q12h |
| < 21 | q18h |
| < 36 | q24h |
| else | q48h |

#### Remainder of calculations

Use calculated ke in same equations/process as [initial PK dosing](#peak-and-trough)

### Single Level (Trough) Revision (HD)

Dose adjustment for HD patient requires goal trough of 10-15 or 15-20 to be selected.

| Level Timing | Target (mcg/mL) | Level (mcg/mL) | Recommendation |
| ------- | ----- | ----- | ----------- |
| Pre-HD  | 10-15 | > 20  | hold        |
| Pre-HD  | 10-15 | 15-20 | 7.5 mg/kg   |
| Pre-HD  | 10-15 | 10-15 | 10 mg/kg    |
| Pre-HD  | 10-15 | < 10  | 15-20 mg/kg |
| Pre-HD  | 15-20 | > 25  | hold        |
| Pre-HD  | 15-20 | 20-25 | 7.5 mg/kg   |
| Pre-HD  | 15-20 | 15-20 | 10 mg/kg    |
| Pre-HD  | 15-20 | < 15  | 15-20 mg/kg |
| Post-HD | 10-15 | > 15  | hold        |
| Post-HD | 10-15 | 10-15 | 7.5 mg/kg   |
| Post-HD | 10-15 | < 10  | 10 mg/kg    |
| Post-HD | 15-20 | > 20  | hold        |
| Post-HD | 15-20 | 15-20 | 7.5 mg/kg   |
| Post-HD | 15-20 | < 15  | 10 mg/kg    |


"Hold dose and order trough before next HD"<br>_or_<br>
"Give `ABW x dose recommendation` mg (`dose recommendation` mg/kg) after HD"

### Two-Level PK

#### Elimination Rate Constant (ke)

$$ke=\frac{e^{\frac{\mathrm{C}_1}{\mathrm{C}_2}}}{\mathrm{T}_1-\mathrm{T_2}}$$

#### Remainder of calculations

Use calculated ke in same equations/process as [initial PK dosing](#peak-and-trough)

### AUC Calculation - Current Dose

$$ke=\frac{-e^{\frac{\mathrm{C_{max}}}{\mathrm{C_{min}}}}}{\mathrm{T_{min}}-\mathrm{T_{max}}}$$

$$\mathrm{C_{true\,max}}=\frac{\mathrm{C_{max}}}{e^{-ke\;\times\,\left(\mathrm{T_{max}}-\tau \right )}}$$

$$\mathrm{C_{true\,min}}=\mathrm{C_{min}\times e^{-ke\;\times\,\left(\tau -\mathrm{T_{min}} \right )}}$$

$$\mathrm{AUC_{inf}}=\left(\mathrm{C_{true\,max}+\mathrm{C_{true\,min}}} \right )\times\frac{\mathrm{T}}{2}$$

$$\mathrm{AUC_{elim}}=\frac{\mathrm{C_{true\,max}-\mathrm{C_{true\,min}}}}{ke}$$

$$\mathrm{AUC}_{24}=\left(\mathrm{AUC_{inf}} + \mathrm{AUC_{elim}} \right )\times \frac{24}{\tau}$$

$$\mathrm{V_d}=\frac{\mathrm{dose}}{\mathrm{T}}\times\frac{1-e^{-ke\;\times\,\tau}}{ke\times \left[\mathrm{C_{true\,max}} -\left(\mathrm{C_{true\,min}\times e^{-ke\;\times\,\tau}} \right )\right ]}$$


### AUC Calculation - New Dose

$$\mathrm{AUC}=\mathrm{AUC_{24}}\times\frac{\mathrm{TDD_{new}}}{\mathrm{TDD_{old}}}$$

$$\mathrm{C_{max}}=\frac{\mathrm{D}}{\mathrm{T}}\times \frac{1-e^{-ke\times\,\mathrm{T}}}{\mathrm{V_d}\times ke\times\left(1-e^{-ke\;\times\,\tau} \right )}$$

> D : new dose

$$\mathrm{C_{min}}=\mathrm{C_{max}}\times e^{-ke\;\times\,\left(\tau -\mathrm{T} \right )}$$

# Aminoglycoside Dosing

## Dosing Weight
Adjusted weight is the standard AdjBW, using factor of 0.4)

| Condition                    | Weight to Use                  |
| ---------------------------- | ------------------------------ |
| if age < 15                  | n/a - guideline does not apply |
| else if overUnder > 20       | use adjusted wt                |
| else if actual wt < ideal wt | use actual wt                  |
| else                         | use ideal weight               |

### Alternate Aminoglycoside Dosing Weight

Used for patients with cystic fibrosis or who are pre- or postpartum.

| Condition              | Weight to Use                  |
| ---------------------- | ------------------------------ |
| if age < 15            | n/a - guideline does not apply |
| else if overUnder > 20 | use adjusted wt                |
| else                   | use actual wt                  |


## Extended Interval Dosing


### Standard (non-Cystic Fibrosis) Calculations

- Infusion time $T$ assumed to be `1 hour`
- Time to complete distribution assumed to be `1.7 hours`
- Goal trough is:
  - **2 mcg/mL** for gentamicin and tobramycin
  - **4 mcg/mL** for amikacin

```mermaid
flowchart LR
  D[[Dose]]:::dose <-->|True peak offset| TP((Peak)):::conc
  TP <-->|2.7 hours| L1[[Level 1]]:::level
  D <-.->|Show warning if < 2.7| L1
  L1 <-->|Calculate ke| L2[[Level 2]]:::level
  L2 <-->|Time to trough| T((Trough)):::conc
  L2 <-->|Time to redose| RD 
  T <-->|Post antibiotic effect| RD[/Redose/]:::dose

  classDef dose fill:#55a63a,stroke:black,color:white
  classDef conc fill:#27aae1,stroke:black,color:white
  classDef level fill:#a2d035,stroke:black,color:white
```

**Calculated ke**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\ln{\left(\frac{\mathrm{level}_1}{\mathrm{level}_2}\right)}}{\mathrm{time\ between\ levels}}$

**Estimated Vd**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\mathrm{dose}}{\mathrm{true\ peak}}$

**Calculated (true) peak**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\mathrm{level}_1}{e^{-(\mathrm{time}_1-2.7)\ \times \ ke}}$

**Time to goal trough (MIC)**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\ln{\left(\frac{\mathrm{level}_1}{\mathrm{level}_2}\right)}}{-ke}$


**Level at redose point**:&nbsp;&nbsp;&nbsp;&nbsp;
$e^{-ke \times \left( \mathrm{Time\ to\ goal\ trough}+\mathrm{Post\ antibiotic\ effect}\right)}\times\mathrm{level}_2$

**Peak to trough time**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\ln{\left(\frac{\mathrm{goal\ trough}}{\mathrm{goal\ peak}}\right)}}{-ke}$

**New dose to redose time**:&nbsp;&nbsp;&nbsp;&nbsp;
Peak to trough time + Post antibiotic effect + 2.7

**Recommended dose**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\mathrm{goal\ peak}}{\mathrm{true\ peak}}\times\mathrm{dose}$

**Recommended frequency**:&nbsp;&nbsp;&nbsp;&nbsp;
Round `New dose to redose time` to nearest 12 hours

**Point level estimate**:&nbsp;&nbsp;&nbsp;&nbsp;
$e^{-ke \times \left( \mathrm{Time\ from\ level_2\ to\ custom\ time}\right)}\times\mathrm{level}_2$

### Cystic Fibrosis Calculations

- Infusion time $T$ assumed to be `1 hour`
- Goal trough is: **Undetectable**
- Goal Peak is:
  - **20-30 mcg/mL** for tobramycin
  - **35-50 mcg/mL** for amikacin
- Goal AUC is:
  - **&lt; 101 mg&middot;hr/L** for q24h tobramycin 
  - **n/a** for amikacin and other tobramycin frequencies


**Calculated ke**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\ln{\left(\frac{\mathrm{level}_1}{\mathrm{level}_2}\right)}}{\mathrm{time\ between\ levels}}$

**Halflife**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{0.693}{ke}$

**Predicted peak**:&nbsp;&nbsp;&nbsp;&nbsp;
$\mathrm{level_1}\div e^{-ke\times\left(\mathrm{time_1}-T\right)}$

> $\mathrm{time_1}$ : time from dose to first level

**Predicted trough**:&nbsp;&nbsp;&nbsp;&nbsp;
$\mathrm{level_2}\times e^{-ke\times\left(\tau-\mathrm{time_2}\right)}$

> $\mathrm{time_2}$ : time from dose to second level <br>
> $\tau$ : frequency

**Calculated AUC**:&nbsp;&nbsp;&nbsp;&nbsp;
$\frac{\mathrm{predicted\ peak}-\mathrm{predicted\ trough}}{ke}$

# Corrected QT Interval

### Calculation Process
- **Adjust for prolonged QRS interval**
  - If QRS > 120, use Modified Bogossian formula to correct the above (QT or average QT)
- **Calculate QTc using the formula determined by the heart rate**
  - If HR < 50, use the Fridericia formula
  - If HR 50-70, use the Bazett formula
  - If HR > 70, use the Framingham formula

### Variables

- **QT** : QT Interval (from EKG)
- **QRS** : QRS Interval (from EKG)
- **HR** : Heart rate (bpm)
- **RR** : $60\div\mathrm{HR}$

### Formulas

| Formula    | Equation                              |
| ---------- | ------------------------------------- |
| Modified Bogossian | $QT-0.5(\mathrm{QRS})$ |
| Fridericia | $\frac{QT}{\sqrt[3]{RR}}$ |
| Bazett     | $\frac{QT}{\sqrt{RR}}$    |
| Framingham | $QT+154(1-RR)$            |

### Diagram

```mermaid
flowchart LR
  QRS[QRS?]:::start -->|<120 msec| NL
  NL[Use QT from EKG]:::green --> HR
  QRS -->|>=120 msec| NH
  NH[Correct QT using Mod. Bogossian]:::blue --> HR
  HR[Determine which<br>formula to use]:::gray -->|HR < 50| F[use Fridericia formula]:::final
  HR -->|HR 50-70| G[use Bazett formula]:::final
  HR -->|HR >70| H[use Framingham formula]:::final

  classDef gray fill:#dedede,stroke:#333,color:black
  classDef calc fill:#FFE5B4,stroke:#FFA500,color:black
  classDef start fill:#a9e695,stroke:#2e691a,color:black
  classDef blue fill:#95dcfa,stroke:#1D7EA8,color:black
  classDef green fill:#d5f291,stroke:#63870e,color:black
  classDef final fill:#ececff,stroke:#c7b5ed,color:black
```

# Corrected Phenytoin Calculation

### Calculation Process
- If concurrent valproic acid, do not calculate; recommend free phenytoin level
- If albumin > 3.2, do not calculate; correction is not needed
- If ESRD or dialysis, use the revised Winter-Tozer equation for renal failure(coefficient 0.2)  and recommend free phenytoin level
- If Neuro ICU, use Kane-modified equation (coefficient 0.29) and recommend free phenytoin level
- If general critical care, use Anderson-modified equation (coefficient 0.25) and recommend free phenytoin level
- Otherwise, use Anderson-modified equation (coefficient 0.25)

### Formula

$\mathrm{est.\ total\ phenytoin}=\frac{P}{\left(C\times A\right)+0.1}$
> $P$ : measured total phenytoin level (mcg/mL)<br>
> $A$ : albumin level (g/dL)<br>
> $C$ : coefficient

### Diagram

```mermaid
flowchart TB
  start[[Start]]:::cont --> vpa
  vpa([Concurrent Valproic Acid?]):::quest -->|Yes| freeonly
  vpa-->|No| albumin
  albumin([Albumin > 3.2]):::quest-->|Yes|nocorr
  albumin -->|No|esrd
  esrd([ESRD or dialysis?]):::quest-->|Yes| RWT["0.2 (rev. WT renal)"]:::coeff-->free
  esrd-->|No|neuro
  neuro([Neuro ICU?]):::quest-->|Yes| KMfree["0.29 (KM)"]:::coeff-->free
  neuro-->|No| AM["0.25 (AM)"]:::coeff
  AM-->icu
  freeonly[Free phenytoin level]:::disclaimer-->nocalc
  nocorr[Correction not needed]:::disclaimer-->nocalc[\"(No calculation)"/]:::red  
  icu([General ICU?]):::quest-->|Yes|free
  
  free[Free phenytoin level highly recommended]:::disclaimer
  classDef quest fill:#ececff,stroke:#beabec,color:#000000
  classDef red fill:#ffeeee,stroke:#ff0000,color:#000000
  classDef disclaimer fill:#ccccff,stroke:#0000ff,color:#000
  classDef coeff fill:#a2d035,stroke:#333,color:#000000
  classDef avg fill:#c4f257,stroke:#a2d035,color:#000000
  classDef cont fill:#8e9299,stroke:#54565a,color:#ffffff
```
### References
1.  Barra ME, Phillips KM, Chung DY, Rosenthal ES. A Novel Correction Equation Avoids High-Magnitude Errors in Interpreting Therapeutic Drug Monitoring of Phenytoin Among Critically Ill Patients. Ther Drug Monit. 2020 Aug;42(4):617-625. doi: 10.1097/FTD.0000000000000739. PMID: 32049893; PMCID: PMC7377971.
1.  Kiang TK, Ensom MH. A Comprehensive Review on the Predictive Performance of the Sheiner-Tozer and Derivative Equations for the Correction of Phenytoin Concentrations. Ann Pharmacother. 2016 Apr;50(4):311-25. doi: 10.1177/1060028016628166. Epub 2016 Jan 29. PMID: 26825643.
1.  Kane SP, Bress AP, Tesoro EP. Characterization of unbound phenytoin concentrations in neurointensive care unit patients using a revised Winter-Tozer equation. Ann Pharmacother. 2013 May;47(5):628-36. doi: 10.1345/aph.1R651. Epub 2013 Apr 19. PMID: 23606554.
1.  Soriano VV, Tesoro EP, Kane SP. Characterization of Free Phenytoin Concentrations in End-Stage Renal Disease Using the Winter-Tozer Equation. Ann Pharmacother. 2017 Aug;51(8):669-674. doi: 10.1177/1060028017707541. Epub 2017 May 4. PMID: 28470115.
1.  Cheng W, Kiang TK, Bring P, Ensom MH. Predictive Performance of the Winter-Tozer and Derivative Equations for Estimating Free Phenytoin Concentration. Can J Hosp Pharm. 2016 Jul-Aug;69(4):269-79. doi: 10.4212/cjhp.v69i4.1573. Epub 2016 Aug 31. PMID: 27621486; PMCID: PMC5008422.
1.  Horton NS, Hanton SL, Sheppard L, Birch K, Chadwick CA. Assessment of the accuracy of estimated free phenytoin concentrations in a mixed patient population. Eur J Hosp Pharm. 2025 Feb 21;32(2):143-148. doi: 10.1136/ejhpharm-2023-003878. PMID: 37802642.
1.  Khan AM, Marvanova M. Prediction Accuracy of Winter-Tozer Equations to Estimate Free Phenytoin Concentrations in Non-Critically Ill Hospitalized Patients. Consult Pharm. 2017 Aug 1;32(8):461-467. doi: 10.4140/TCP.n.2017.461. PMID: 29029667.