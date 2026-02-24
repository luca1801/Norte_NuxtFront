import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FormTextarea from "../../../app/components/FormTextarea.vue"

describe("FormTextarea", () => {
  it("renders with label", () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "",
        label: "Description",
      },
    })
    expect(wrapper.text()).toContain("Description")
  })

  it("shows required indicator when required", () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "",
        label: "Description",
        required: true,
      },
    })
    expect(wrapper.find(".text-error").exists()).toBe(true)
  })

  it("shows error message when error prop is provided", () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "",
        error: "Description is required",
      },
    })
    expect(wrapper.text()).toContain("Description is required")
    expect(wrapper.find("textarea").classes()).toContain("textarea-error")
  })

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "",
      },
    })
    const textarea = wrapper.find("textarea")
    await textarea.setValue("test description")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["test description"])
  })

  it("applies disabled class when disabled", () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "",
        disabled: true,
      },
    })
    expect(wrapper.find("textarea").classes()).toContain("textarea-disabled")
  })

  it("uses placeholder when provided", () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "",
        placeholder: "Enter description",
      },
    })
    expect(wrapper.find("textarea").attributes("placeholder")).toBe("Enter description")
  })

  it("sets rows attribute correctly", () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "",
        rows: 6,
      },
    })
    expect(wrapper.find("textarea").attributes("rows")).toBe("6")
  })

  it("displays modelValue correctly", () => {
    const wrapper = mount(FormTextarea, {
      props: {
        modelValue: "Existing text",
      },
    })
    expect(wrapper.find("textarea").element.value).toBe("Existing text")
  })
})
