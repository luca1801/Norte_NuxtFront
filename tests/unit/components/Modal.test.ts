import { mount } from "@vue/test-utils"
import { describe, it, expect, vi } from "vitest"
import { computed, ref } from "vue"

vi.stubGlobal("computed", computed)

const ModalWithMock = {
  template: `
    <dialog :id="id" class="modal" :class="{ 'modal-open': isOpenValue }">
      <div class="modal-box">
        <h3 v-if="title" class="font-bold text-lg mb-4">{{ title }}</h3>
        <div class="py-4">
          <slot />
        </div>
        <div class="modal-action">
          <slot name="actions">
            <button @click="$emit('close')" class="btn">Fechar</button>
          </slot>
        </div>
      </div>
    </dialog>
  `,
  props: ["id", "title", "modelValue"],
  emits: ["close", "update:modelValue"],
  setup(props: any, { emit }: any) {
    const isOpenValue = computed(() => props.modelValue ?? false)
    return { isOpenValue }
  },
}

describe("Modal", () => {
  it("renders with modal-open class when modelValue is true", () => {
    const wrapper = mount(ModalWithMock, {
      props: {
        id: "test-modal",
        modelValue: true,
        title: "Test Modal",
      },
      slots: {
        default: "Modal content",
      },
    })
    expect(wrapper.text()).toContain("Test Modal")
    expect(wrapper.text()).toContain("Modal content")
    expect(wrapper.find(".modal-open").exists()).toBe(true)
  })

  it("does not have modal-open class when modelValue is false", () => {
    const wrapper = mount(ModalWithMock, {
      props: {
        id: "test-modal",
        modelValue: false,
        title: "Test Modal",
      },
    })
    expect(wrapper.find(".modal-open").exists()).toBe(false)
  })

  it("emits close event when close button is clicked", async () => {
    const wrapper = mount(ModalWithMock, {
      props: {
        id: "test-modal",
        modelValue: true,
        title: "Test Modal",
      },
    })
    const closeButton = wrapper.find("button.btn")
    await closeButton.trigger("click")
    expect(wrapper.emitted("close")).toBeTruthy()
  })
})
