import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FormSelect from "../../../app/components/FormSelect.vue"

describe("FormSelect", () => {
  const mockOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ]

  it("renders with label", () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "",
        label: "Category",
        options: mockOptions,
      },
    })
    expect(wrapper.text()).toContain("Category")
  })

  it("shows required indicator when required", () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "",
        label: "Category",
        options: mockOptions,
        required: true,
      },
    })
    expect(wrapper.find(".text-error").exists()).toBe(true)
  })

  it("renders all options", () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "",
        options: mockOptions,
      },
    })
    const options = wrapper.findAll("option")
    expect(options).toHaveLength(4) // 3 options + 1 placeholder
    expect(options[1].text()).toBe("Option 1")
    expect(options[2].text()).toBe("Option 2")
    expect(options[3].text()).toBe("Option 3")
  })

  it("shows error message when error prop is provided", () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "",
        options: mockOptions,
        error: "Please select an option",
      },
    })
    expect(wrapper.text()).toContain("Please select an option")
    expect(wrapper.find("select").classes()).toContain("select-error")
  })

  it("emits update:modelValue on change", async () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "",
        options: mockOptions,
      },
    })
    const select = wrapper.find("select")
    await select.setValue("option2")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["option2"])
  })

  it("applies disabled class when disabled", () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "",
        options: mockOptions,
        disabled: true,
      },
    })
    expect(wrapper.find("select").classes()).toContain("select-disabled")
  })

  it("uses custom placeholder when provided", () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "",
        options: mockOptions,
        placeholder: "Choose an option",
      },
    })
    const placeholderOption = wrapper.find("option[value='']")
    expect(placeholderOption.text()).toBe("Choose an option")
  })

  it("selects correct option based on modelValue", () => {
    const wrapper = mount(FormSelect, {
      props: {
        modelValue: "option2",
        options: mockOptions,
      },
    })
    const select = wrapper.find("select")
    expect(select.element.value).toBe("option2")
  })
})
