import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FormInput from "../../../app/components/FormInput.vue"

describe("FormInput", () => {
  it("renders with label", () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: "",
        label: "Username",
      },
    })
    expect(wrapper.text()).toContain("Username")
  })

  it("shows required indicator when required", () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: "",
        label: "Username",
        required: true,
      },
    })
    expect(wrapper.find(".text-error").exists()).toBe(true)
  })

  it("shows error message when error prop is provided", () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: "",
        error: "This field is required",
      },
    })
    expect(wrapper.text()).toContain("This field is required")
    expect(wrapper.find("input").classes()).toContain("input-error")
  })

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: "",
      },
    })
    const input = wrapper.find("input")
    await input.setValue("test value")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["test value"])
  })

  it("applies disabled class when disabled", () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: "",
        disabled: true,
      },
    })
    expect(wrapper.find("input").classes()).toContain("input-disabled")
  })

  it("uses correct input type", () => {
    const wrapper = mount(FormInput, {
      props: {
        modelValue: "",
        type: "password",
      },
    })
    expect(wrapper.find("input").attributes("type")).toBe("password")
  })
})
