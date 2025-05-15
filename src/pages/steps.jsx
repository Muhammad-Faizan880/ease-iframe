import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import WeightTrackerChart from "../components/chart";
import SimpleSlider from "../components/slider";

function StepperForm() {
  const totalSteps = 8;

  const getInitialStep = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepFromUrl = parseInt(urlParams.get("step"), 8);
    if (stepFromUrl && stepFromUrl >= 1 && stepFromUrl <= totalSteps) {
      return stepFromUrl;
    }
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    weightGoal: "",
    weightGoalGraph: "",
    birthDate: "",
    zipCode: "",
    weight: null,
    heightFeet: null,
    heightInches: null,
    secondMonthGoal: null,
    thirdMonthGoal: null,
    fourthMonthGoal: null,
    goalDate: null,
    sex: null,
    medicationAnswer: null,
    selectedDose: null,
    selectedProduct: 1,
    selectedLinks: [
      "https://checkout.ease-md.com/i/29",
      "https://checkout.ease-md.com/i/46",
      "https://checkout.ease-md.com/i/51",
    ],
  });

  // Watch for changes in weight
  useEffect(() => {
    if (formData.weight) {
      const calculatedGoal = Math.round(formData.weight * 0.18);
      const secondMonth = formData.weight - Math.round(calculatedGoal * 0.27);
      const thirdMonth = formData.weight - Math.round(calculatedGoal * 0.67);
      const fourthMonth = formData.weight - calculatedGoal;

      // Calculate date after 3 months
      const today = new Date();
      const futureDate = new Date(today.setMonth(today.getMonth() + 3));

      // Format MM/DD/YYYY
      const formattedDate = `${(futureDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${futureDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${futureDate.getFullYear()}`;

      setFormData((prev) => ({
        ...prev,
        weightGoalGraph: calculatedGoal,
        secondMonthGoal: secondMonth,
        thirdMonthGoal: thirdMonth,
        fourthMonthGoal: fourthMonth,
        goalDate: formattedDate,
      }));
    }
  }, [formData.weight]);

  const [errors, setErrors] = useState({
    heightFeet: "",
    heightInches: "",
    weight: "",
    email: "",
    birthDate: "",
    zipCode: "",
  });

  const [activeTab, setActiveTab] = useState("home");
  const [accordionOpen, setAccordionOpen] = useState(null);
  const [medicationAnswer, setMedicationAnswer] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showFirstPara, setShowFirstPara] = useState(false);
  const [showSecondPara, setShowSecondPara] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelectedOption(option.label);
    setIsOpen(false);

    setFormData((prev) => ({
      ...prev,
      selectedDose: option.label,
      selectedLinks: option.links,
    }));
  };

  // BMI Calculation
  useEffect(() => {
    const feet = parseFloat(formData.heightFeet);
    const inches = parseFloat(formData.heightInches);
    const weight = parseFloat(formData.weight);

    if (!isNaN(feet) && !isNaN(inches) && !isNaN(weight)) {
      const totalInches = feet * 12 + inches;
      if (totalInches > 0) {
        const bmiValue = (weight / (totalInches * totalInches)) * 703;
        setBmi(bmiValue.toFixed(2));
      }
    } else {
      setBmi(null);
    }
  }, [formData]);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  useEffect(() => {
    if (currentStep !== 7 || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, timeLeft]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (loading) {
      const firstTimeout = setTimeout(() => setShowFirstPara(true), 1000); // 2 sec
      const secondTimeout = setTimeout(() => setShowSecondPara(true), 2000); // 4 sec

      return () => {
        clearTimeout(firstTimeout);
        clearTimeout(secondTimeout);
      };
    } else {
      // reset when loading ends
      setShowFirstPara(false);
      setShowSecondPara(false);
    }
  }, [loading]);

  const handleMedicationChange = (value) => {
    handleChange({
      target: { name: "medication", value },
    });
    handleSelection(value);
  };

  // Handle medication selection and step progress
  const handleSelection = (answer) => {
    setMedicationAnswer(answer);

    // Update formData with medicationAnswer
    setFormData((prev) => ({
      ...prev,
      medicationAnswer: answer,
    }));

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setCurrentStep(7);
    }, 3000);
  };

  // Total number of steps

  // Handle tab input changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Update formData with selected sex
    if (tab === "home") {
      setFormData({
        ...formData,
        sex: "Male",
      });
    } else if (tab === "profile") {
      setFormData({
        ...formData,
        sex: "Female",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log(name);
    setFormData({
      ...formData,
      [name]: value,
    });

    // ✅ Auto move from step 2 to step 3 after selecting a weight goal
    if (currentStep === 2 && name === "weightGoal") {
      setTimeout(() => {
        nextStep();
      }, 300);
    }
  };

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set("step", currentStep);
    window.history.replaceState({}, "", url);
  }, [currentStep]);

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);

      // Update the URL without page reload
      const url = new URL(window.location);
      url.searchParams.set("step", next);
      window.history.pushState({}, "", url);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);

      // Update the URL without page reload
      const url = new URL(window.location);
      url.searchParams.set("step", prev);
      window.history.pushState({}, "", url);
    }
  };

  //product start//

  const productsMob = [
    {
      id: 1,
      title: "6 Month Plan",
      price: "$209",
      bottle: "/bottle",
      save: "Save $1,619 Instantly",
      para: "3 bottles shipped every 3 months",
      para1: "Access to Dr. Sam’s VIP Community",
      // para2: "Includes: Personalized Diet Plans, Workshops, Community Support",
      para3: "56% TOTAL SAVINGS",
      image: "/assets/images/6.png",
      buttonLabel: "SELECT PLAN",
      cancel: "Cancel or Change plan anytime",
      badge: "BEST VALUE",
      redirectUrl: "https://checkout.ease-md.com/i/51",
    },
    {
      id: 2,
      title: "3 Month Plan",
      price: "$251",
      bottle: "/bottle",
      save: "Save $684 Instantly",
      para: "3 bottles shipped every 3 months",
      para1: "Access to Dr. Sam’s VIP Community",
      // para2: "Includes: Personalized Diet Plans, Workshops, Community Support",
      para3: "48% TOTAL SAVINGS",
      image: "/assets/images/3.png",
      buttonLabel: "SELECTED",
      cancel: "Cancel or Change plan anytime",
      redirectUrl: "https://checkout.ease-md.com/i/46",
    },
    {
      id: 3,
      title: "1 Month Plan",
      price: "$279",
      bottle: "/bottle",
      save: "Save $200 Instantly",
      para: "1 Bottle. Shipped every month",
      para1: "Great for trying it out risk-free",
      para3: "42% TOTAL Savings",
      image: "/assets/images/67.png",
      buttonLabel: "SELECT PLAN",
      cancel: "Cancel or Change plan anytime",
      redirectUrl: "https://checkout.ease-md.com/i/29",
    },
  ];
  const stepHeadings = [
    "GOALS",
    "GOALS",
    "GOALS",
    "GOALS",
    "ELIGIBILITY",
    "GOALS",
    "CHOOSE MEDICATION",
    "PACKAGE SELECTION",
  ];

  const doseOptions = [
    {
      label: "Semaglutide 0.25 mg/wk",
      links: [
        "https://checkout.ease-md.com/i/29",
        "https://checkout.ease-md.com/i/46",
        "https://checkout.ease-md.com/i/51",
      ],
    },
    {
      label: "Semaglutide 0.5 mg/wk",
      links: [
        "https://checkout.ease-md.com/i/30",
        "https://checkout.ease-md.com/i/47",
        "https://checkout.ease-md.com/i/52",
      ],
    },
    {
      label: "Semaglutide 1 mg/wk",
      links: [
        "https://checkout.ease-md.com/i/31",
        "https://checkout.ease-md.com/i/42",
        "https://checkout.ease-md.com/i/53",
      ],
    },
    {
      label: "Semaglutide 1.5 mg/wk",
      links: [
        "https://checkout.ease-md.com/i/32",
        "https://checkout.ease-md.com/i/43",
        "https://checkout.ease-md.com/i/54",
      ],
    },
    {
      label: "Semaglutide 2 mg/wk",
      links: [
        "https://checkout.ease-md.com/i/33",
        "https://checkout.ease-md.com/i/44",
        "https://checkout.ease-md.com/i/55",
      ],
    },
    {
      label: "Semaglutide 2.5 mg/wk",
      links: [
        "https://checkout.ease-md.com/i/34",
        "https://checkout.ease-md.com/i/45",
        "https://checkout.ease-md.com/i/56",
      ],
    },
  ];

  const products = [
    {
      id: 1,
      title: "6 Month Plan",
      price: "$209",
      bottle: "/bottle",
      save: "Save $1,619 Instantly",
      para: "6 Bottles. 3 bottles shipped every 3 mos.",
      para1: "Access to Dr. Sam’s VIP Community",
      para2: "Includes: Personalized Diet Plans, Workshops, Community Support",
      para3: "56% TOTAL SAVINGS",
      image: "/assets/images/6.png",
      buttonLabel: "SELECT PLAN",
      cancel: "Cancel or Change plan anytime",
      badge: "BEST VALUE",
      redirectUrl: "https://checkout.ease-md.com/i/51",
      doseOptions: doseOptions,
    },
    {
      id: 2,
      title: "3 Month Plan",
      price: "$251",
      bottle: "/bottle",
      save: "Save $684 Instantly",
      para: "3 bottles shipped every 3 months",
      para1: "Access to Dr. Sam’s VIP Community",
      para2: "Includes: Personalized Diet Plans, Workshops, Community Support",
      para3: "48% TOTAL SAVINGS",
      image: "/assets/images/3.png",
      buttonLabel: "SELECTED",
      cancel: "Cancel or Change plan anytime",
      redirectUrl: "https://checkout.ease-md.com/i/46",
      doseOptions: doseOptions,
    },
    {
      id: 3,
      title: "1 Month Plan",
      price: "$279",
      bottle: "/bottle",
      save: "Save $200 Instantly",
      para: "1 Bottle. Shipped every month",
      para1: "Great for trying it out risk-free",
      para2: "",
      para3: "42% TOTAL Savings",
      image: "/assets/images/67.png",
      buttonLabel: "SELECT PLAN",
      cancel: "Cancel or Change plan anytime",
      redirectUrl: "https://checkout.ease-md.com/i/29",
      doseOptions: doseOptions,
    },
  ];

  const handleProductSelect = (productId) => {
    console.log("Selected Product ID:", productId);

    setFormData((prev) => ({
      ...prev,
      selectedProduct: productId,
    }));
    setAccordionOpen(null);
  };

  //product end
  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => (prev === section ? null : section));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validate fullName on Step 1
    if (currentStep === 1 && formData.fullName.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        fullName: "Please enter your full name.",
      }));
      return false; // Prevent the next step if validation fails
    } else {
      setErrors((prev) => ({
        ...prev,
        fullName: "",
      }));
      // Proceed to next step
    }

    // Validate height and weight on Step 3
    if (currentStep === 3) {
      const newErrors = {};
      let isValid = true;

      // Validate height (feet and inches)
      if (!formData.heightFeet || formData.heightFeet <= 0) {
        newErrors.heightFeet = true; // Just track as true if there's an error
        isValid = false;
      }
      if (
        !formData.heightInches ||
        formData.heightInches < 0 ||
        formData.heightInches > 12
      ) {
        newErrors.heightInches = true; // Just track as true if there's an error
        isValid = false;
      }

      // Validate weight
      if (!formData.weight || formData.weight <= 0) {
        newErrors.weight = true; // Just track as true if there's an error
        isValid = false;
      }

      setErrors(newErrors);

      // If validation fails, don't proceed
      if (!isValid) {
        return;
      }
    }

    // ...step 5 validation......
    if (currentStep === 5) {
      const newErrors = {};
      let isValid = true;

      // Validate email
      if (!formData.email || formData.email <= 0) {
        newErrors.email = true;
        isValid = false;
      }
      if (!formData.birthDate) {
        newErrors.birthDate = "Birth Date is required";
        isValid = false;
      } else {
        const dateParts = formData.birthDate.split("-");
        const year = dateParts[0];

        if (!/^\d{4}$/.test(year)) {
          newErrors.birthDate = "Year must be exactly 4 digits";
          isValid = false;
        } else if (
          Number(year) < 1900 ||
          Number(year) > new Date().getFullYear()
        ) {
          newErrors.birthDate = `Year must be between 1900 and ${new Date().getFullYear()}`;
          isValid = false;
        }
      }

      console.log(formData);
      // Validate zipcode
      if (
        !formData.zipCode ||
        formData.zipCode <= 0 ||
        formData.zipCode.toString().length > 5
      ) {
        newErrors.zipCode = true;
        isValid = false;
      }

      setErrors(newErrors);

      // If validation fails, don't proceed
      if (!isValid) {
        return;
      }
    }

    // ...step 5 validation. end.....

    // ✅ For other steps, just move forward or submit
    if (currentStep === totalSteps) {
      console.log("Form submitted:", formData);
      // alert("Form submitted successfully!");
    } else {
      nextStep();
    }
  };

  // Render form content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h4 className=" class-name-style">What is your full name?</h4>
            <div className="mb-4">
              <input
                type="text"
                className={`form-control input-style ${
                  errors.fullName ? "border-danger" : ""
                }`}
                id="fullName"
                name="fullName"
                placeholder="e.g. Jane Smith"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h4 className="class-name-style">What is your weight loss goal?</h4>
            <div className="mb-3">
              <div
                className="card mb-3"
                onClick={() =>
                  handleChange({
                    target: { name: "weightGoal", value: "lose1-20" },
                  })
                }
                style={{
                  borderColor: "#8E8E8E",
                  borderRadius: "6px",
                  height: "78px",
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div className="card-body p-3">
                  <div
                    className="form-check"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      className="form-check-input custom-radio-button"
                      type="radio"
                      name="weightGoal"
                      id="goal1"
                      value="lose1-20"
                      checked={formData.weightGoal === "lose1-20"}
                      onChange={handleChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      className="form-check-label text0-clr"
                      htmlFor="goal1"
                    >
                      Lose 1-20 lbs for good
                    </label>
                  </div>
                </div>
              </div>

              <div
                className="card mb-3"
                onClick={() =>
                  handleChange({
                    target: { name: "weightGoal", value: "lose21-50" },
                  })
                }
                style={{
                  borderColor: "#8E8E8E",
                  borderRadius: "6px",
                  height: "78px",
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div className="card-body p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input custom-radio-button"
                      type="radio"
                      name="weightGoal"
                      id="goal2"
                      value="lose21-50"
                      checked={formData.weightGoal === "lose21-50"}
                      onChange={handleChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      className="form-check-label text0-clr"
                      htmlFor="goal2"
                    >
                      Lose 21-50 lbs for good
                    </label>
                  </div>
                </div>
              </div>

              <div
                className="card mb-3"
                onClick={() =>
                  handleChange({
                    target: { name: "weightGoal", value: "loseOver50" },
                  })
                }
                style={{
                  borderColor: "#8E8E8E",
                  borderRadius: "6px",
                  height: "78px",
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div className="card-body p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input custom-radio-button"
                      type="radio"
                      name="weightGoal"
                      id="goal3"
                      value="loseOver50"
                      checked={formData.weightGoal === "loseOver50"}
                      onChange={handleChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      className="form-check-label text0-clr"
                      htmlFor="goal3"
                    >
                      Lose over 50 lbs for good
                    </label>
                  </div>
                </div>
              </div>

              <div
                className="card mb-3"
                onClick={() =>
                  handleChange({
                    target: { name: "weightGoal", value: "maintain" },
                  })
                }
                style={{
                  borderColor: "#8E8E8E",
                  borderRadius: "6px",
                  height: "78px",
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div className="card-body p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input custom-radio-button"
                      type="radio"
                      name="weightGoal"
                      id="goal4"
                      value="maintain"
                      checked={formData.weightGoal === "maintain"}
                      onChange={handleChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      className="form-check-label text0-clr"
                      htmlFor="goal4"
                    >
                      Maintain my weight and get fit
                    </label>
                  </div>
                </div>
              </div>
              <div
                className="card mb-3"
                onClick={() =>
                  handleChange({
                    target: { name: "weightGoal", value: "sure" },
                  })
                }
                style={{
                  borderColor: "#8E8E8E",
                  borderRadius: "6px",
                  height: "78px",
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div className="card-body p-3">
                  <div className="form-check">
                    <input
                      className="form-check-input custom-radio-button"
                      type="radio"
                      name="weightGoal"
                      id="goal5"
                      value="sure"
                      checked={formData.weightGoal === "sure"}
                      onChange={handleChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      className="form-check-label text0-clr"
                      htmlFor="goal5"
                    >
                      I'm not really sure
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h4 className="class-name-style">
              What is your current height & weight?
            </h4>

            <p className="class-bmi">Your BMI</p>
            <p className="class-bmi-1">{bmi ? bmi : "00.00"}</p>
            <div className="bg-gradient"></div>

            <div className="d-flex gap-3">
              {/* Height - Feet */}
              <div className="flex-grow-1">
                <label htmlFor="height1" className="form-label fontyy mb-0">
                  Feet
                </label>
                <div className="position-relative">
                  <input
                    type="number"
                    className={`form-control pe-5 class-border ${
                      errors.heightFeet ? "border-danger" : ""
                    }`}
                    id="height1"
                    name="heightFeet"
                    placeholder=""
                    value={formData.heightFeet}
                    onChange={handleChange}
                  />
                  <span className="position-absolute top-50 translate-middle-y end-0 pe-3">
                    Ft.
                  </span>
                </div>
                {errors.heightFeet && (
                  <small className="text-danger">{errors.heightFeet}</small>
                )}
              </div>

              {/* Height - Inches */}
              <div className="flex-grow-1">
                <label htmlFor="height2" className="form-label fontyy mb-0">
                  Inches
                </label>
                <div className="position-relative">
                  <input
                    type="number"
                    className={`form-control pe-5 class-border ${
                      errors.heightInches ? "border-danger" : ""
                    }`}
                    id="height2"
                    name="heightInches"
                    placeholder=""
                    value={formData.heightInches}
                    onChange={handleChange}
                  />
                  <span className="position-absolute top-50 translate-middle-y end-0 pe-3 text-muted">
                    In.
                  </span>
                </div>
                {errors.heightInches && (
                  <small className="text-danger">{errors.heightInches}</small>
                )}
              </div>
            </div>

            {/* Weight */}
            <div className="flex-grow-1">
              <label htmlFor="weight" className="form-label fontyy mb-0">
                Current weight (lbs.)
              </label>
              <div className="position-relative">
                <input
                  type="number"
                  className={`form-control pe-5 class-border1 ${
                    errors.weight ? "border-danger" : ""
                  }`}
                  id="weight"
                  name="weight"
                  placeholder=""
                  value={formData.weight}
                  onChange={handleChange}
                />
                <span className="position-absolute top-50 translate-middle-y end-0 pe-3 text-muted">
                  Lbs.
                </span>
              </div>
              {errors.weight && (
                <small className="text-danger">{errors.weight}</small>
              )}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h4 className="class-name-style">
              {formData.fullName}, we can help you lose up to{" "}
              {formData.weightGoalGraph} pounds by {formData.goalDate}!
            </h4>

            <WeightTrackerChart formData={formData} />
          </>
        );
      case 5:
        return (
          <>
            <h4 className="class-name-style">
              Find out if you're eligible in your state
            </h4>
            <p className="paragraph-style-div">
              This info helps your doctor determine if you're eligible for
              treatment in your state.
            </p>

            <p className="class-sex">Please select your sex</p>
            <div className="mb-4">
              <div className=" mt-5">
                <ul className="nav nav-tabs" id="myTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <div
                      className={`nav-link ${
                        activeTab === "home" ? "active-tab" : ""
                      }`}
                      id="home-tab"
                      onClick={() => handleTabChange("home")}
                      role="tab"
                      aria-controls="home"
                      aria-selected={activeTab === "home"}
                    >
                      Male
                    </div>
                  </li>
                  <li className="nav-item" role="presentation">
                    <div
                      className={`nav-link ${
                        activeTab === "profile" ? "active-tab" : ""
                      }`}
                      id="profile-tab"
                      onClick={() => handleTabChange("profile")}
                      role="tab"
                      aria-controls="profile"
                      aria-selected={activeTab === "profile"}
                    >
                      Female
                    </div>
                  </li>
                </ul>

                <div className="tab-content" id="myTabsContent">
                  <div
                    className={`tab-pane fade show active`}
                    id="home"
                    role="tabpanel"
                    aria-labelledby="home-tab"
                  >
                    <div className="flex-grow-1 class-padding-22">
                      <label
                        htmlFor="height2"
                        className="form-label fontyy mb-0"
                      >
                        Email
                      </label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className={`form-control pe-5 input-style ${
                            errors.email ? "border-danger" : ""
                          }`}
                          id="email"
                          name="email"
                          placeholder="e.g. Jane Smith@gmail.com"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1 class-padding-22">
                      <label
                        htmlFor="height2"
                        className="form-label fontyy mb-0"
                      >
                        Birth Date
                      </label>
                      <div className="position-relative">
                        <input
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          className={`form-control input-style ${
                            errors.birthDate ? "border-danger" : ""
                          }`}
                          id="birthDate"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1 ">
                      <label
                        htmlFor="height2"
                        className="form-label fontyy mb-0"
                      >
                        Zip Code
                      </label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className={`form-control pe-5 input-style ${
                            errors.zipCode ? "border-danger" : ""
                          }`}
                          id="zipCode"
                          name="zipCode"
                          placeholder="#####"
                          maxLength={5}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 6:
        return (
          <>
            {!formData.medication && !loading && (
              <h4 className="class-name-style">
                Are you taking any prescription medication?
              </h4>
            )}

            <div className="medication-step-container">
              {loading ? (
                <div className="text-center my-4">
                  <p className="checkk">Checking our database…</p>

                  <div className="loader">
                    <div className="loader-bar"></div>
                  </div>
                  {showFirstPara && (
                    <p className="licensed">
                      We only work with{" "}
                      <span className="licensed-1">
                        licensed providers in your state
                      </span>{" "}
                      who specialize in weight loss.
                    </p>
                  )}
                  {showSecondPara && (
                    <p className="licensed-11 text-center">
                      We found <span className="licensed-1">providers</span>{" "}
                      near you.. Lose up to{" "}
                      <span className="licensed-1">
                        1.5% of your body weight
                      </span>{" "}
                      per week on Semaglutide.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div
                    className="card mb-3"
                    onClick={() => handleMedicationChange("yes")}
                    style={{
                      borderColor: "#8E8E8E",
                      borderRadius: "6px",
                      height: "78px",
                      display: "flex",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="form-check">
                        <input
                          className="form-check-input custom-radio-button"
                          type="radio"
                          name="medication"
                          id="yes"
                          value="yes"
                          checked={formData.medication === "yes"}
                          onChange={() => handleMedicationChange("yes")}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label
                          className="form-check-label text0-clr"
                          htmlFor="yes"
                          style={{ cursor: "pointer" }}
                        >
                          Yes
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* NO CARD */}
                  <div
                    className="card mb-3"
                    onClick={() => handleMedicationChange("no")}
                    style={{
                      borderColor: "#8E8E8E",
                      borderRadius: "6px",
                      height: "78px",
                      display: "flex",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="form-check">
                        <input
                          className="form-check-input custom-radio-button"
                          type="radio"
                          name="medication"
                          id="no"
                          value="no"
                          checked={formData.medication === "no"}
                          onChange={() => handleMedicationChange("no")}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label
                          className="form-check-label text0-clr"
                          htmlFor="no"
                          style={{ cursor: "pointer" }}
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {!loading && (
              <img
                src="/assets/images/frame.png"
                alt=""
                className="img-width-doctor"
              />
            )}
          </>
        );

      case 7:
        return (
          <>
            <h4 className="class-name-style">Your state is eligible! ✅</h4>
            <p className="all-start">
              All our medications is shipped from FDA regulated 503a and 503b
              pharmacies.
            </p>
            <div className="bg-green-dynamic-div">
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-center-divvv">
                  Claim your discounted GLP-1 now while supplies last!
                </p>
                {currentStep === 7 && (
                  <p className="text-center-divv">{formatTime(timeLeft)}</p>
                )}
              </div>
            </div>

            <div className="product-selection-container">
              <div className="mb-3 rounded-4">
                <div>
                  <div className="text-center mb-3">
                    <img
                      src="/assets/images/big-bg.png"
                      alt="Selected Product"
                      className="img-fluid CLASS-WIDTH-FULL"
                    />
                  </div>

                  <h5 className="class-compound">
                    Compounded {selectedOption || "Semaglutide 0.25 mg/wk"}
                  </h5>

                  {medicationAnswer === "yes" && (
                    <>
                      <h4 className="class-name-style">
                        Choose Your GLP-1 Dosage
                      </h4>
                      <div
                        style={{
                          width: "100%",
                          position: "relative",
                          marginBottom: "40px",
                        }}
                      >
                        {/* Dropdown button */}
                        <div
                          onClick={toggleDropdown}
                          style={{
                            padding: "10px",
                            border: "2px solid #2FBAAC",
                            borderRadius: "16px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span className="dose-class">
                            {selectedOption || "Select Dose"}
                          </span>

                          {/* Dropdown image icon */}
                          <img
                            src={
                              isOpen
                                ? "/assets/images/Vectorr.png"
                                : "/assets/images/Vector.png"
                            }
                            alt="Dropdown arrow"
                            style={{
                              width: "18px",
                              height: "11px",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </div>

                        {/* Dropdown menu */}
                        {isOpen && (
                          <div
                            style={{
                              position: "absolute",
                              top: "40px",
                              left: "0",
                              width: "100%",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              background: "#fff",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            {doseOptions.map((option, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  handleSelect(option);
                                  //console.log("Selected Links:", option.links);
                                }}
                                className="option-clr"
                                style={{
                                  padding: "10px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #ddd",
                                }}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="class-flex-expand mb-2">
                    <span className="class-current">$279</span>
                    <span className="class-original text-decoration-line-through">
                      $479
                    </span>
                  </div>

                  <div className="class-stock gap-2 mb-2">
                    <span className="bg-sett">● In Stock</span>
                    <span className="code-class">
                      Code Activated:{" "}
                      <span className="class-color"> GLP200</span>
                    </span>
                  </div>

                  <p className="text-inter-class">
                    Discover the power of Semaglutide, the active ingredient in
                    Ozempic® & WeGovy® for a fraction of the cost. All customers
                    also receive free expedited shipping.
                  </p>

                  {/* Accordion Section */}
                  <div className="accordion mt-3">
                    {[
                      {
                        title: "Details",
                        heading: "Licensed Pharmacies",
                        content:
                          "All of our semaglutide is sourced from licensed USA based compounding pharmacies. All batches go through stringent testing to ensure quality.",
                        heading1: "Free Online Vetting",
                        content1:
                          "Our nurses and providers view your intake form to ensure you meet the requirements for Semaglutide. Your safety is our top concern.",
                        heading2: "Personalized Plan",
                        content2:
                          "After viewing your intake form our EaseMD nurses will offer a personalized dosage plan catering to your specific needs.",
                        heading3: "24/7 Support & Care",
                        content3:
                          "Our care team is available 24/7 to answer any questions or concerns you may have.",
                      },
                      {
                        title: "Active Ingredients",
                        heading: "Important Safety Information",
                        content:
                          "Prescription products require an online evaluation with a licensed medical professional who will determine if a prescription is appropriate. Plans are offered as a subscription service which can be canceled at any time. Actual product packaging may appear differently than shown. Physicians may prescribe compounded medications as needed to meet patient requirements or address drug shortages.",
                        content1:
                          "*The FDA does not review or approve any compounded medications for safety or effectiveness. Prices are subject to change based on dosage increases.",
                      },
                      {
                        title: "Why Injectable Semaglutide?",
                        heading: "Efficacy",
                        content:
                          " The injectable form allows for better absorption and bioavailability, enhancing its effectiveness in managing weight and blood sugar.",
                        heading1: "Dosing Convenience",
                        content1:
                          "It's typically administered once a week, making it easier for patients to incorporate into their routines compared to daily medications.",
                        heading2: "Stability",
                        content2:
                          "The injectable formulation maintains the stability of the active ingredient, ensuring it remains effective over time.",
                        heading3: "Controlled Release",
                        content3:
                          "The injection allows for a controlled release of the medication, providing consistent therapeutic effects.",
                      },
                    ].map((item, index) => (
                      <div key={index} className="border-top py-2">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAccordion(item.title);
                          }}
                          className="d-flex justify-content-between align-items-center"
                          style={{ cursor: "pointer" }}
                        >
                          <span className="detail-class">{item.title}</span>
                          <span className="plus-minus">
                            {accordionOpen === item.title ? "−" : "+"}
                          </span>
                        </div>

                        {accordionOpen === item.title && (
                          <div className="mt-2 class-content">
                            {(() => {
                              const sections = [];
                              let count = 1;

                              Object.keys(item).forEach((key) => {
                                if (key.startsWith("heading")) {
                                  const contentKey =
                                    key === "heading"
                                      ? "content"
                                      : "content" + key.slice(7);

                                  const headingText = `${item[key]}`;
                                  const contentText = item[contentKey];

                                  // Only apply numbered bullets in third object
                                  if (index === 2) {
                                    sections.push(
                                      <div key={key}>
                                        <p className="class-text-dropdown">
                                          {count++}. {headingText}:
                                        </p>
                                        <p className="classs-text-content">
                                          {contentText}
                                        </p>
                                      </div>
                                    );
                                  } else {
                                    // Default (no numbering)
                                    sections.push(
                                      <div key={key}>
                                        <p className="class-text-dropdown">
                                          {headingText}
                                        </p>
                                        <p className="classs-text-content">
                                          {contentText}
                                        </p>
                                      </div>
                                    );
                                  }
                                }
                              });

                              if (sections.length === 0 && item.content) {
                                sections.push(
                                  <p key="only-content">{item.content}</p>
                                );
                              }

                              return sections;
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 8:
        return (
          <>
            <h4 className="class-name-style">Select your Monthly Plan</h4>
            <p className="all-start">
              Choose your preferred monthly plan.
              <br />
              Lock in bigger savings with longer plans.
            </p>

            <div>
              <div className="bg-warning-clr">
                🎉 Code Activated: GLP200 - $200 OFF each bottle
              </div>
            </div>

            {currentStep === 8 && (
              <>
                <div className="product-selection-container d-none d-lg-block">
                  <div
                    className="some-add-text"
                    style={{
                      backgroundColor: "#3C4B9E",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "4px 12px",
                      marginLeft: "18px",
                      zIndex: 10,
                    }}
                  >
                    BEST VALUE
                  </div>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product.id)}
                      className={`card card-height mb-3 rounded-4 shadow-sm ${
                        formData.selectedProduct === product.id
                          ? "selected-product"
                          : ""
                      }`}
                      style={{ position: "relative", overflow: "hidden" }}
                    >
                      <div className="container">
                        <div className="row">
                          <div
                            className="col-4"
                            style={{
                              backgroundColor: "#E5F5F3",
                              borderRadius: "16px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "148px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="class-imgg justify-content-center align-items-center text-align-center"
                            />
                          </div>
                          <div className="col-5 class-height-custom">
                            <h5 className="class-title-new">{product.title}</h5>
                            <div className="bg-div-dark">{product.save}</div>

                            <div className="flex-class-div gap-1">
                              <img
                                src="/assets/images/SVG.svg"
                                alt=""
                                className="img-tick-set"
                              />
                              <p className="class-details">{product.para}</p>
                            </div>
                            <div className="flex-class-div gap-1">
                              <img
                                src="/assets/images/SVG.svg"
                                alt=""
                                className="img-tick-set"
                              />
                              <p className="class-details">{product.para1}</p>
                            </div>
                            {typeof product.para2 === "string" &&
                              product.para2.trim() !== "" && (
                                <div className="flex-class-div gap-1">
                                  <img
                                    src="/assets/images/SVG.svg"
                                    alt=""
                                    className="img-tick-set"
                                  />
                                  <p className="class-details">
                                    {product.para2}
                                  </p>
                                </div>
                              )}
                            {typeof product.para3 === "string" &&
                              product.para3.trim() !== "" && (
                                <div className="flex-class-div gap-1">
                                  <img
                                    src="/assets/images/SVG.svg"
                                    alt=""
                                    className="img-tick-set"
                                  />
                                  <p className="class-details-color">
                                    {product.para3}
                                  </p>
                                </div>
                              )}
                            <p className="class-details-new1">
                              {product.para4}
                            </p>
                          </div>

                          <div className="col-3">
                            <p className="class-title-price">
                              {product.price}
                              <span className="class-title-price-1">
                                {product.bottle}
                              </span>
                            </p>
                            <div className="button-class-gray">
                              <button
                                className={`button-class-gray-text ${
                                  formData.selectedProduct === product.id
                                    ? "selected-button-red"
                                    : "default-color"
                                }`}
                              >
                                {formData.selectedProduct === product.id
                                  ? "SELECTED"
                                  : "SELECT PLAN"}
                              </button>
                            </div>
                            <p className="cancel-class">{product.cancel}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* // ........................mobile-screen......................... */}

                <div className="product-selection-container d-block d-lg-none">
                  {productsMob.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product.id)}
                      className={`card mb-3 rounded-4 shadow-sm  ${
                        formData.selectedProduct === product.id
                          ? "selected-product"
                          : ""
                      }`}
                      style={{ position: "relative" }}
                    >
                      {product.badge && (
                        <div
                          className="some-add-text"
                          style={{
                            position: "absolute",
                            top: "-23px",
                            left: "16px",
                            backgroundColor: "#3C4B9E",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "bold",
                            padding: "4px 12px",

                            zIndex: 10,
                          }}
                        >
                          {product.badge}
                        </div>
                      )}
                      <div className="container">
                        <div className="row">
                          <div
                            className="col-6 center-image   "
                            style={{
                              backgroundColor: "#E5F5F3",
                              borderRadius: "16px",
                              display: "grid",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="class-imgg "
                            />
                            <h5 className="class-title-new-mob">
                              {product.title}
                            </h5>
                            <div className="bg-div-dark-mob">
                              {product.save}
                            </div>
                          </div>
                          <div className="col-6 ">
                            <p className="class-title-price-mob">
                              {product.price}
                              <span className="class-title-price-1-mob">
                                {product.bottle}
                              </span>
                            </p>
                            <div className="button-class-gray">
                              <button
                                className={`button-class-gray-text ${
                                  formData.selectedProduct === product.id
                                    ? "selected-button-red"
                                    : "default-color"
                                }`}
                              >
                                {formData.selectedProduct === product.id
                                  ? "SELECTED"
                                  : "SELECT PLAN"}
                              </button>
                            </div>
                            <p className="cancel-class-mob">{product.cancel}</p>

                            <div className="flex-class-div gap-1">
                              <img
                                src="/assets/images/SVG.svg"
                                alt=""
                                className="img-tick-set"
                              />
                              <p className="class-details-mob">
                                {product.para}
                              </p>
                            </div>
                            <div className="flex-class-div gap-1">
                              <img
                                src="/assets/images/SVG.svg"
                                alt=""
                                className="img-tick-set"
                              />
                              <p className="class-details-mob">
                                {product.para1}
                              </p>
                            </div>
                            {product.para2 && (
                              <div className="flex-class-div gap-1">
                                <img
                                  src="/assets/images/SVG.svg"
                                  alt=""
                                  className="img-tick-set"
                                />
                                <p className="class-details-mob">
                                  {product.para2}
                                </p>
                              </div>
                            )}

                            {product.para3 && (
                              <div className="flex-class-div gap-1">
                                <img
                                  src="/assets/images/SVG.svg"
                                  alt=""
                                  className="img-tick-set"
                                />
                                <p className="class-details-color">
                                  {product.para3}
                                </p>
                              </div>
                            )}

                            <p className="class-details-new1-mob">
                              {product.para4}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="container ptb-class">
        <div className="row justify-content-center">
          <div className="col-xl-7 col-xxl-6 col-12">
            <div className="card border-0">
              <div className="card-body padding-class">
                {/* Header with back button and title in flex layout */}
                <div className="class-goals mb-3 ">
                  {currentStep === 1 ? (
                    <div style={{ width: "100px" }} />
                  ) : (
                    <button
                      type="button"
                      className="btn btn-link btn-bg text-decoration-none no-hover-color"
                      onClick={prevStep}
                    >
                      <img
                        src="/assets/images/arrow.png"
                        alt=""
                        className="margin-set"
                      />{" "}
                      Back
                    </button>
                  )}
                  <h6
                    className="text-center text-set-class m-0"
                    style={{
                      paddingRight: currentStep === 1 ? "80px" : "40px",
                    }}
                  >
                    {stepHeadings[currentStep - 1] || ""}
                  </h6>
                  <span className="text-setting">
                    {currentStep}/{totalSteps}
                  </span>
                </div>

                {/* Progress bar - styled like the reference image */}
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "16px" }}
                  >
                    <div
                      className="progress-bar custom-progress-bar"
                      role="progressbar"
                      style={{
                        width: `${(currentStep / totalSteps) * 100}%`,
                      }}
                      aria-valuenow={(currentStep / totalSteps) * 100}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Form content - styled like reference image */}
                  <div className="form-step ">{renderStepContent()}</div>

                  {/* Continue button - styled like reference image */}
                  {currentStep !== 2 &&
                    currentStep !== 6 &&
                    (currentStep === 8 ? (
                      <div className="d-flex justify-content-center mt-4">
                        <button
                          type="button"
                          className="btn btn-setting-class-custom rounded-pill py-3"
                          onClick={() => {
                            console.log(formData.selectedProduct);
                            if (formData.selectedProduct === 1) {
                              window.location.href = formData.selectedLinks[2];
                            }
                            if (formData.selectedProduct === 2) {
                              window.location.href = formData.selectedLinks[1];
                            }
                            if (formData.selectedProduct === 3) {
                              window.location.href = formData.selectedLinks[0];
                            }
                          }}
                        >
                          Lock in Your Plan
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-center mt-4">
                        <button
                          type="submit"
                          className="btn btn-setting-class-custom rounded-pill py-3"
                          disabled={
                            medicationAnswer === "yes" && !selectedOption
                          }
                        >
                          {currentStep === 3 || currentStep === 5
                            ? "Next"
                            : currentStep === totalSteps
                            ? "Submit"
                            : "Continue"}
                        </button>
                      </div>
                    ))}

                  {/* Paragraph to show at Step 5 */}
                  {currentStep === 5 && (
                    <div className="mt-3">
                      <div className="container container-paddingt">
                        <div className="flex-container-3-images ">
                          <div
                            className=" align-items-center"
                            style={{ width: "33.33%" }}
                          >
                            <img
                              src="/assets/images/bg3.png"
                              alt="Image"
                              className="img-fluid mb-2"
                              style={{
                                maxWidth: "80%",
                                height: "auto",
                                margin: "auto",
                              }}
                            />
                            <p className="texty-paragr">100% Data Security</p>
                          </div>

                          <div
                            className=" align-items-center"
                            style={{ width: "33.33%" }}
                          >
                            <img
                              src="/assets/images/bg2.png"
                              alt="Image"
                              className="img-fluid mb-2"
                              style={{
                                maxWidth: "80%",
                                height: "auto",
                                margin: "auto",
                              }}
                            />
                            <p className="texty-paragr">24/7 Expert Support</p>
                          </div>

                          <div
                            className=" align-items-center"
                            style={{ width: "33.33%" }}
                          >
                            <img
                              src="/assets/images/bg1.png"
                              alt="Image"
                              className="img-fluid mb-2"
                              style={{
                                maxWidth: "80%",
                                height: "auto",
                                margin: "auto",
                              }}
                            />
                            <p className="texty-paragrq1">
                              60-Day Money Back Guarantee
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentStep === 4 && (
        <>
          <SimpleSlider />
        </>
      )}

      {(currentStep === 7 || currentStep === 8) && (
        <div className="mt-4 class-width-testimonials">
          <div className="row">
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4 ">
              <div className=" testimonials-cards-style ">
                <img
                  src="assets/images/testi-star.svg"
                  alt=""
                  className="img-padd-b"
                />
                <p className="glad-class">Finally, Something That Worked</p>
                <p className="glad-class-p">
                  Ease MD was exactly what I needed. I’d tried so many diets,
                  plans, and apps before, but nothing ever stuck. This program
                  made weight loss feel simple and achievable.
                </p>

                <div className="clas-flex-img-client gap-3">
                  <img
                    src="/assets/images/pic.svg"
                    alt="Client"
                    className="rounded-circle"
                    style={{ width: "48px", height: "48px" }}
                  />

                  <div className="lindsay-margin ">
                    <p className="class-lindsay">Lindsay</p>
                    <div className="d-flex align-items-center gap-1 class-margin">
                      <img
                        src="/assets/images/SVG.png"
                        alt="Verified"
                        className="padding-set"
                        style={{ width: "17px", height: "17px" }}
                      />
                      <p className="class-verify">Verified Buyer</p>
                    </div>
                  </div>
                </div>
                <p className="date-class">
                  Date of experience:{" "}
                  <span className="date">February 07, 2025</span>
                </p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4">
              <div className=" testimonials-cards-style-2 ">
                <div className="position-relative ">
                  <img
                    src="/assets/images/Jennifer.png"
                    alt=""
                    className="width-setjennni"
                  />
                  {/* Green box (Right Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG-1 text-white px-2 py-1 rounded-pill">
                    After
                  </div>

                  {/* Red box (Left Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG text-white px-2 py-1 rounded-pill">
                    Before
                  </div>
                </div>
                <div className="padding-card-2">
                  <p className="jeni-style">Tanya</p>
                  <div className=" gap-1 class-margin-2">
                    <img
                      src="/assets/images/SVG.png"
                      alt="Verified"
                      className="padding-set-2"
                      style={{ width: "17px", height: "17px" }}
                    />
                    <p className="class-verify">Verified Buyer</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center w-set class-mb-sett">
                    <p className="date-class">
                      Date of experience:{" "}
                      <span className="date">February 04, 2025</span>
                    </p>

                    <div className="bg-gray-0 ">
                      <p className="loast-class">
                        lost <span className="loast-class-2"> 92lbs</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4 d-none d-lg-block">
              <div className=" testimonials-cards-style ">
                <img
                  src="assets/images/testi-star.svg"
                  alt=""
                  className="img-padd-b"
                />
                <p className="glad-class">Support That Makes a Difference</p>
                <p className="glad-class-p">
                  This program gave me the structure and support I didn’t even
                  realize I needed. It wasn’t overwhelming — it was manageable,
                  step by step
                </p>

                <div className="clas-flex-img-client gap-3">
                  <img
                    src="/assets/images/pic1.svg"
                    alt="Client"
                    className="rounded-circle"
                    style={{ width: "48px", height: "48px" }}
                  />

                  <div className="lindsay-margin ">
                    <p className="class-lindsay">Sofia</p>
                    <div className="d-flex align-items-center gap-1 class-margin">
                      <img
                        src="/assets/images/SVG.png"
                        alt="Verified"
                        className="padding-set"
                        style={{ width: "17px", height: "17px" }}
                      />
                      <p className="class-verify">Verified Buyer</p>
                    </div>
                  </div>
                </div>
                <p className="date-class">
                  Date of experience:{" "}
                  <span className="date">February 07, 2025</span>
                </p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4 d-none d-lg-block">
              <div className=" testimonials-cards-style-2 ">
                <div className="position-relative ">
                  <img
                    src="/assets/images/healthy.png"
                    alt=""
                    className="width-setjennni"
                  />
                  {/* Green box (Right Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG-1 text-white px-2 py-1 rounded-pill">
                    After
                  </div>

                  {/* Red box (Left Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG text-white px-2 py-1 rounded-pill">
                    Before
                  </div>
                </div>
                <div className="padding-card-2">
                  <p className="jeni-style">Daisy</p>
                  <div className=" gap-1 class-margin-2">
                    <img
                      src="/assets/images/SVG.png"
                      alt="Verified"
                      className="padding-set-2"
                      style={{ width: "17px", height: "17px" }}
                    />
                    <p className="class-verify">Verified Buyer</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center w-set">
                    <p className="date-class">
                      Date of experience:{" "}
                      <span className="date">February 04, 2025</span>
                    </p>

                    <div className="bg-gray-0">
                      <p className="loast-class">
                        lost <span className="loast-class-2"> 92lbs</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4 d-none d-lg-block">
              <div className=" testimonials-cards-style-2 ">
                <div className="position-relative">
                  <img
                    src="/assets/images/Jennifer1.png"
                    alt=""
                    className="width-setjennni"
                  />
                  {/* Green box (Right Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG-1 text-white px-2 py-1 rounded-pill">
                    After
                  </div>

                  {/* Red box (Left Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG text-white px-2 py-1 rounded-pill">
                    Before
                  </div>
                </div>
                <div className="padding-card-2">
                  <p className="jeni-style">Mia</p>
                  <div className=" gap-1 class-margin-2">
                    <img
                      src="/assets/images/SVG.png"
                      alt="Verified"
                      className="padding-set-2"
                      style={{ width: "17px", height: "17px" }}
                    />
                    <p className="class-verify">Verified Buyer</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center w-set">
                    <p className="date-class">
                      Date of experience:{" "}
                      <span className="date">February 04, 2025</span>
                    </p>

                    <div className="bg-gray-0">
                      <p className="loast-class">
                        lost <span className="loast-class-2"> 92lbs</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4 d-none d-lg-block">
              <div className=" testimonials-cards-style ">
                <img
                  src="assets/images/testi-star.svg"
                  alt=""
                  className="img-padd-b"
                />
                <p className="glad-class">From Stuck to Strong</p>
                <p className="glad-class-p">
                  I was feeling stuck and frustrated. No matter what I did,
                  nothing seemed to help me lose weight or feel better. Then I
                  found Ease MD, and everything changed.
                </p>

                <div className="clas-flex-img-client gap-3">
                  <img
                    src="/assets/images/pic2.svg"
                    alt="Client"
                    className="rounded-circle"
                    style={{ width: "48px", height: "48px" }}
                  />

                  <div className="lindsay-margin ">
                    <p className="class-lindsay">Sarah</p>
                    <div className="d-flex align-items-center gap-1 class-margin">
                      <img
                        src="/assets/images/SVG.png"
                        alt="Verified"
                        className="padding-set"
                        style={{ width: "17px", height: "17px" }}
                      />
                      <p className="class-verify">Verified Buyer</p>
                    </div>
                  </div>
                </div>
                <p className="date-class">
                  Date of experience:{" "}
                  <span className="date">February 07, 2025</span>
                </p>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4 d-none d-lg-block">
              <div className=" testimonials-cards-style-2 ">
                <div className="position-relative ">
                  <img
                    src="/assets/images/Jennifer3.png"
                    alt=""
                    className="width-setjennni"
                  />
                  {/* Green box (Right Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG-1 text-white px-2 py-1 rounded-pill">
                    After
                  </div>

                  {/* Red box (Left Bottom) */}
                  <div className="position-absolute CLASS-BG-TAG text-white px-2 py-1 rounded-pill">
                    Before
                  </div>
                </div>
                <div className="padding-card-2">
                  <p className="jeni-style">Kim</p>
                  <div className=" gap-1 class-margin-2">
                    <img
                      src="/assets/images/SVG.png"
                      alt="Verified"
                      className="padding-set-2"
                      style={{ width: "17px", height: "17px" }}
                    />
                    <p className="class-verify">Verified Buyer</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center w-set">
                    <p className="date-class">
                      Date of experience:{" "}
                      <span className="date">February 04, 2025</span>
                    </p>

                    <div className="bg-gray-0">
                      <p className="loast-class">
                        lost <span className="loast-class-2"> 92lbs</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-6 col-xxl-4 custom-1700 mb-4 d-none d-lg-block">
              <div className=" testimonials-cards-style ">
                <img
                  src="assets/images/testi-star.svg"
                  alt=""
                  className="img-padd-b"
                />
                <p className="glad-class">Consistency at Last</p>
                <p className="glad-class-p">
                  I’ve always struggled with sticking to a plan. But Ease MD
                  made it easy to stay consistent. The approach was gentle but
                  effective, and I actually looked forward to the updates and
                  check-ins.
                </p>

                <div className="clas-flex-img-client gap-3">
                  <img
                    src="/assets/images/pic3.svg"
                    alt="Client"
                    className="rounded-circle"
                    style={{ width: "48px", height: "48px" }}
                  />

                  <div className="lindsay-margin ">
                    <p className="class-lindsay">Andrea</p>
                    <div className="d-flex align-items-center gap-1 class-margin">
                      <img
                        src="/assets/images/SVG.png"
                        alt="Verified"
                        className="padding-set"
                        style={{ width: "17px", height: "17px" }}
                      />
                      <p className="class-verify">Verified Buyer</p>
                    </div>
                  </div>
                </div>
                <p className="date-class">
                  Date of experience:{" "}
                  <span className="date">February 07, 2025</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StepperForm;
