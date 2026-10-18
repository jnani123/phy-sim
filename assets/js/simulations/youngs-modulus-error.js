(function (global) {
  global.PYQSimulationConfigs = Object.freeze({
    "youngs-modulus-error": Object.freeze({
      steps: Object.freeze([
        {
          title: "We are measuring a wire",
          phrase: "The diameter of a wire measured by a screw gauge of least count 0.001 cm is 0.08 cm.",
          text: "We apply a known load to a thin wire, measure its original length and its extension, and use those values with the wire's cross-sectional area to determine Young's modulus.",
          equation: String.raw`Y=\frac{F\ell}{A\Delta\ell}`,
          focus: "wire",
          misconception: "The original length ℓ is the wire before loading. The extension Δℓ is only the small change in that length."
        },
        {
          title: "Measure the tiny diameter",
          phrase: "The diameter of a wire measured by a screw gauge of least count 0.001 cm is 0.08 cm.",
          text: "A screw gauge measures the wire's very small diameter. Its stated least count is the measurement uncertainty used in this question's calculation.",
          equation: String.raw`d=0.08\ \mathrm{cm},\qquad \Delta d=0.001\ \mathrm{cm},\qquad \frac{\Delta d}{d}=\frac{0.001}{0.08}`,
          focus: "diameter",
          misconception: "A least count is not the measured diameter. Here the diameter is 0.08 cm; the uncertainty assigned to that measurement is 0.001 cm.",
          challenge: {
            id: "area-doubling",
            question: "If the relative diameter error doubles, what happens to the relative area error?",
            options: ["It doubles", "It stays the same", "It becomes four times larger"],
            answer: 0,
            feedback: "Area is proportional to d², so ΔA/A = 2Δd/d. Doubling Δd/d doubles ΔA/A."
          }
        },
        {
          title: "Measure the original length",
          phrase: "The length measured by a scale of least count 0.1 cm is 150 cm.",
          text: "The scale measures the wire's original length ℓ. Its 0.1 cm least count is the uncertainty in that length measurement; it is not the wire's extension.",
          equation: String.raw`\ell=150\ \mathrm{cm},\qquad \Delta\ell_{\text{measurement}}=0.1\ \mathrm{cm},\qquad \frac{\Delta\ell_{\text{measurement}}}{\ell}=\frac{0.1}{150}`,
          focus: "length",
          misconception: "Do not confuse the scale's uncertainty of 0.1 cm with the extension of 0.5 cm measured separately."
        },
        {
          title: "Apply the load and measure extension",
          phrase: "When a weight of 100 N is applied to the wire, the extension in length is 0.5 cm, measured by a micrometer of least count 0.001 cm.",
          text: "The load stretches the wire. The extension Δℓ is 0.5 cm, and the micrometer uncertainty in that measured extension is Δ(Δℓ) = 0.001 cm. The drawing exaggerates the stretch so you can see it.",
          equation: String.raw`F=100\ \mathrm{N},\qquad \Delta\ell=0.5\ \mathrm{cm},\qquad \Delta(\Delta\ell)=0.001\ \mathrm{cm},\qquad \frac{\Delta(\Delta\ell)}{\Delta\ell}=\frac{0.001}{0.5}`,
          focus: "extension",
          misconception: "Δ(Δℓ) means the uncertainty in the measured extension. It is different from Δℓ itself."
        },
        {
          title: "Relate the measurements to Young's modulus",
          phrase: "The error in the measured Young's modulus",
          text: "Young's modulus is longitudinal stress divided by longitudinal strain. For this wire, stress is F/A and strain is Δℓ/ℓ, so Y = Fℓ/(AΔℓ).",
          equation: String.raw`Y=\frac{F/A}{\Delta\ell/\ell}=\frac{F\ell}{A\Delta\ell}`,
          focus: "modulus",
          misconception: "Young's modulus is not the applied force. It depends on force, original length, area, and extension together."
        },
        {
          title: "Why diameter contributes twice",
          phrase: "The error in the measured Young's modulus",
          text: "A circular wire has area A = πd²/4, so A is proportional to d². The power of two makes the maximum relative area error 2Δd/d; it has nothing to do with the wire having two ends.",
          equation: String.raw`A=\frac{\pi d^2}{4}\propto d^2\quad\Longrightarrow\quad\frac{\Delta A}{A}=2\frac{\Delta d}{d}`,
          focus: "area",
          misconception: "The factor of two comes from the exponent on d in the area formula—not from counting two ends of the wire."
        },
        {
          title: "Follow the question's load instruction",
          phrase: "Ignore the contribution of the load to Young's modulus error calculation",
          text: "For this question only, omit the load's uncertainty contribution, following the supplied solution's convention. This is not a claim that every real load is perfectly measured.",
          equation: String.raw`\text{For this calculation:}\qquad \frac{\Delta F}{F}=0`,
          focus: "force",
          misconception: "The 100 N load is still used to calculate Y. Only its uncertainty contribution is omitted."
        },
        {
          title: "Combine the three relative-error contributions",
          phrase: "least count 0.001 cm is 0.08 cm. The length measured by a scale of least count 0.1 cm is 150 cm.",
          text: "With the load term omitted, add the original-length, diameter, and extension contributions. The diameter term is largest because its uncertainty is doubled and its measured value is small.",
          equation: String.raw`\frac{0.1}{150}+2\frac{0.001}{0.08}+\frac{0.001}{0.5}\approx 0.0277=2.77\%`,
          focus: "error",
          misconception: "0.0277 is a dimensionless relative-error fraction (2.77%), not an absolute error in N/m²."
        },
        {
          title: "Convert to SI units and calculate Y",
          phrase: "The error in the measured Young's modulus",
          text: "To report Young's modulus in N/m², convert each length to metres before substituting: ℓ = 1.5 m, d = 0.0008 m, and Δℓ = 0.005 m.",
          equation: String.raw`\ell=1.5\ \mathrm{m},\quad d=0.0008\ \mathrm{m},\quad\Delta\ell=0.005\ \mathrm{m};\quad Y=\frac{100(1.5)}{\frac{\pi}{4}(0.0008)^2(0.005)}\approx5.97\times10^{10}\ \mathrm{N/m^2}`,
          focus: "si",
          misconception: "Using centimetres in this formula and labelling the result N/m² would make the units inconsistent."
        },
        {
          title: "Find the absolute error and select the answer",
          phrase: "The value of α is _____.",
          text: "Multiply the relative-error fraction by Young's modulus to get an absolute error with units. Comparing ΔY with α × 10⁹ N/m² gives α ≈ 1.65, option (2).",
          equation: String.raw`\Delta Y=0.0277Y\approx1.65\times10^9\ \mathrm{N/m^2}\qquad\therefore\qquad\alpha=1.65`,
          focus: "result",
          misconception: "The relative error 0.0277 has no units. The absolute error ΔY is about 1.65×10⁹ N/m²."
        }
      ]),
      solveSteps: Object.freeze([
        {
          title: "Write the definition of Young's modulus",
          finding: "Find Y for the stretched wire.",
          principle: "Young's modulus is longitudinal stress divided by longitudinal strain.",
          equation: String.raw`Y=\frac{F/A}{\Delta\ell/\ell}=\frac{F\ell}{A\Delta\ell}`,
          why: "Stress is force per area; strain is extension divided by original length.",
          substitution: String.raw`F=100\ \mathrm{N},\quad \ell=150\ \mathrm{cm},\quad \Delta\ell=0.5\ \mathrm{cm}`,
          units: "Use SI lengths when calculating Y in N/m².",
          mistake: "Do not swap the original length ℓ and extension Δℓ."
        },
        {
          title: "Write the circular cross-sectional area",
          finding: "Express the wire area using its measured diameter.",
          principle: "The radius is d/2 and the area of a circle is πr².",
          equation: String.raw`A=\pi\left(\frac d2\right)^2=\frac{\pi d^2}{4}`,
          why: "This puts Young's modulus directly in terms of the measured diameter.",
          substitution: String.raw`A=\frac{\pi(0.08\ \mathrm{cm})^2}{4}\quad\text{(convert d to metres before evaluating Y)}`,
          units: "Area is in m² when d is in metres.",
          mistake: "Using πd² instead of πd²/4 overestimates the area by a factor of four."
        },
        {
          title: "Propagate the relative errors",
          finding: "Build the maximum relative error in Y.",
          principle: "For products and quotients, add the magnitudes of relative errors, multiplied by the absolute powers.",
          equation: String.raw`\frac{\Delta Y}{Y}=\frac{\Delta F}{F}+\frac{\Delta\ell}{\ell}+\frac{\Delta A}{A}+\frac{\Delta(\Delta\ell)}{\Delta\ell}`,
          why: "Y is proportional to Fℓ and inversely proportional to AΔℓ.",
          substitution: String.raw`\frac{\Delta A}{A}=2\frac{\Delta d}{d}`,
          units: "Each relative-error term is dimensionless.",
          mistake: "The area term must be replaced by the diameter term, not counted as a separate independent measurement."
        },
        {
          title: "Derive the factor of two",
          finding: "Convert the area uncertainty into the diameter uncertainty.",
          principle: "If a quantity is proportional to d², its relative uncertainty receives a factor of 2.",
          equation: String.raw`A\propto d^2\quad\Longrightarrow\quad\frac{\Delta A}{A}=2\frac{\Delta d}{d}`,
          why: "The exponent 2 on d is the reason; it is unrelated to the two ends of the wire.",
          substitution: String.raw`2\frac{\Delta d}{d}=2\frac{0.001}{0.08}`,
          units: "Dimensionless.",
          mistake: "Do not omit the factor of two or explain it by counting wire ends."
        },
        {
          title: "Omit the load uncertainty as instructed",
          finding: "Apply the question's stated assumption.",
          principle: "The supplied solution excludes the load's relative-error contribution.",
          equation: String.raw`\frac{\Delta F}{F}=0`,
          why: "The force still appears in the calculation of Y; only its uncertainty term is omitted.",
          substitution: String.raw`\frac{\Delta Y}{Y}=\frac{0.1}{150}+2\frac{0.001}{0.08}+\frac{0.001}{0.5}`,
          units: "The uncertainty sum remains dimensionless.",
          mistake: "Do not remove F from the Young's-modulus formula."
        },
        {
          title: "Calculate the original-length contribution",
          finding: "Find the scale's contribution to relative error.",
          principle: "Relative measurement error is absolute uncertainty divided by measured value.",
          equation: String.raw`\frac{\Delta\ell_{\text{measurement}}}{\ell}=\frac{0.1\ \mathrm{cm}}{150\ \mathrm{cm}}`,
          why: "Both values describe the original length measurement and use the same unit.",
          substitution: String.raw`\frac{0.1}{150}\approx0.000667`,
          units: "Dimensionless, or approximately 0.0667%.",
          mistake: "The scale uncertainty is 0.1 cm—not the 0.5 cm extension."
        },
        {
          title: "Calculate the diameter contribution",
          finding: "Find the screw-gauge contribution, including the area exponent.",
          principle: "The area depends on diameter squared, so double the diameter's relative error.",
          equation: String.raw`2\frac{\Delta d}{d}=2\frac{0.001\ \mathrm{cm}}{0.08\ \mathrm{cm}}`,
          why: "This is the propagated area uncertainty in the denominator of Y.",
          substitution: String.raw`2\left(\frac{0.001}{0.08}\right)=0.025`,
          units: "Dimensionless, or 2.5%.",
          mistake: "Using Δd/d without the factor 2 understates this contribution."
        },
        {
          title: "Calculate the extension contribution",
          finding: "Find the micrometer's contribution to relative error.",
          principle: "Divide the uncertainty in the extension measurement by the measured extension.",
          equation: String.raw`\frac{\Delta(\Delta\ell)}{\Delta\ell}=\frac{0.001\ \mathrm{cm}}{0.5\ \mathrm{cm}}`,
          why: "The measured quantity is the extension; its own uncertainty is Δ(Δℓ).",
          substitution: String.raw`\frac{0.001}{0.5}=0.002`,
          units: "Dimensionless, or 0.2%.",
          mistake: "Do not divide 0.001 cm by the original length of 150 cm."
        },
        {
          title: "Sum relative errors and calculate Y in SI",
          finding: "Find the total relative error and Young's modulus.",
          principle: "Add the three measurement contributions, then substitute metre values into Y.",
          equation: String.raw`\epsilon=\frac{0.1}{150}+2\frac{0.001}{0.08}+\frac{0.001}{0.5}=0.027667\approx0.0277`,
          why: "The three terms are maximum relative-error contributions under the supplied assumption.",
          substitution: String.raw`\ell=1.5\ \mathrm m,\ d=0.0008\ \mathrm m,\ \Delta\ell=0.005\ \mathrm m;\quad Y=\frac{100(1.5)}{\frac{\pi}{4}(0.0008)^2(0.005)}`,
          units: "ε is dimensionless; Y is in N/m².",
          mistake: "Do not use centimetres and then report the modulus as N/m²."
        },
        {
          title: "Calculate absolute error and choose the option",
          finding: "Find ΔY and the requested coefficient α.",
          principle: "Absolute error equals relative error multiplied by the measured value.",
          equation: String.raw`\Delta Y=\epsilon Y\approx0.0277(5.97\times10^{10})=1.65\times10^9\ \mathrm{N/m^2}`,
          why: "The question expresses the absolute error as α × 10⁹ N/m².",
          substitution: String.raw`\alpha\approx1.65\quad\Rightarrow\quad\text{Option (2)}`,
          units: "ΔY is in N/m²; α is dimensionless.",
          mistake: "0.0277 is the relative error, not the requested α."
        }
      ]),
      challenges: Object.freeze([
        {
          id: "largest-contribution",
          question: "Which measurement contributes most to the original relative error?",
          options: ["Original length", "Diameter", "Extension"],
          answer: 1,
          feedback: "Diameter contributes 2(0.001/0.08) = 0.025 (2.5%), more than the length's 0.0667% or extension's 0.2%."
        },
        {
          id: "absolute-scales",
          question: "If relative error stays the same but Young's modulus doubles, what happens to absolute error?",
          options: ["It doubles", "It stays the same", "It halves"],
          answer: 0,
          feedback: "Absolute error is relative error multiplied by Young's modulus: ΔY = εY. With ε fixed, doubling Y doubles ΔY."
        },
        {
          id: "diameter-doubles",
          question: "If diameter doubles while its least count stays fixed, what happens to 2Δd/d?",
          options: ["It doubles", "It halves", "It stays the same"],
          answer: 1,
          feedback: "The numerator is unchanged while d doubles, so the relative diameter contribution 2Δd/d is halved."
        }
      ])
    })
  });
})(window);
