import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import StatCard from "../../../app/components/StatCard.vue"

describe("StatCard", () => {
  it("renders with title and value", () => {
    const wrapper = mount(StatCard, {
      props: {
        title: "Total Equipment",
        value: 42,
      },
    })
    expect(wrapper.text()).toContain("Total Equipment")
    expect(wrapper.text()).toContain("42")
  })

  it("renders with description", () => {
    const wrapper = mount(StatCard, {
      props: {
        title: "Events",
        value: 10,
        description: "Active events",
      },
    })
    expect(wrapper.text()).toContain("Active events")
  })

  it("applies valueColor class", () => {
    const wrapper = mount(StatCard, {
      props: {
        title: "Alerts",
        value: 5,
        valueColor: "text-error",
      },
    })
    expect(wrapper.find(".stat-value").classes()).toContain("text-error")
  })

  it("applies containerClass", () => {
    const wrapper = mount(StatCard, {
      props: {
        title: "Test",
        value: 1,
        containerClass: "bg-primary",
      },
    })
    expect(wrapper.find(".stats").classes()).toContain("bg-primary")
  })
})
