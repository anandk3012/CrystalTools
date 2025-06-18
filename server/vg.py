import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from IPython.display import HTML, display
import matplotlib as mpl
import re

mpl.rcParams['animation.embed_limit'] = 50  # MB

def wave_superposition(case: str):
    w0_per_2pi = 0.5
    k0_per_2pi = 0.4

    if case == "Vp>0, Vg<0":
        w1_per_2pi = 0.7
        k1_per_2pi = 0.2
    elif case == "Vp>0, Vg>0":
        w1_per_2pi = 0.6
        k1_per_2pi = 0.5
    elif case == "Vp>0, Vg=0":
        w1_per_2pi = 0.5
        k1_per_2pi = 0.6
    else:
        raise ValueError("Invalid case selected")

    w0 = 2 * np.pi * w0_per_2pi
    k0 = 2 * np.pi * k0_per_2pi
    w1 = 2 * np.pi * w1_per_2pi
    k1 = 2 * np.pi * k1_per_2pi

    delta_w = (w0 - w1) / 2
    delta_k = (k0 - k1) / 2

    x = np.linspace(-10, 10, 500)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
    fig.suptitle(f'Wave Superposition ({case})', fontsize=16)

    line_f0, = ax1.plot([], [], label='f₀(x)', color='blue')
    line_f1, = ax1.plot([], [], label='f₁(x)', color='green')
    line_sum, = ax2.plot([], [], label='f(x) = f₀ + f₁', color='red')
    line_env, = ax2.plot([], [], color='orange', linestyle='--', label='Envelope')
    line_env2, = ax2.plot([], [], color='orange', linestyle='--')

    for ax in [ax1, ax2]:
        ax.set_xlim(-10, 10)
        ax.set_ylim(-3, 3)
        ax.grid(True)
        ax.legend()

    ax1.set_title("f₀ and f₁")
    ax2.set_title("Resultant Wave f(x)")

    def init():
        line_f0.set_data([], [])
        line_f1.set_data([], [])
        line_sum.set_data([], [])
        line_env.set_data([], [])
        line_env2.set_data([], [])
        return line_f0, line_f1, line_sum, line_env, line_env2

    def update(frame):
        t = frame * 0.05
        f0 = np.cos(w0 * t - k0 * x)
        f1 = np.cos(w1 * t - k1 * x)
        f = f0 + f1
        envelope = 2 * np.cos(delta_w * t - delta_k * x)

        line_f0.set_data(x, f0)
        line_f1.set_data(x, f1)
        line_sum.set_data(x, f)
        line_env.set_data(x, envelope)
        line_env2.set_data(x, -envelope)
        return line_f0, line_f1, line_sum, line_env, line_env2


    ani = FuncAnimation(fig, update, frames=150, init_func=init, blit=True)
    
    filename_map = {
    "Vp>0, Vg<0": "vp-pos-vg-neg",
    "Vp>0, Vg>0": "vp-pos-vg-pos",
    "Vp>0, Vg=0": "vp-pos-vg-zero",
  }

    filename = f"phase_group_velocity_{filename_map[case]}.html"
    ani.save(filename, writer='html')
    
    plt.close(fig)
    display(HTML(ani.to_jshtml()))

# Example usage:
wave_superposition("Vp>0, Vg<0")  # -> saves phase_group_velocity_Vp_pos_Vg_neg.html
wave_superposition("Vp>0, Vg>0")  # -> saves phase_group_velocity_Vp_pos_Vg_pos.html
wave_superposition("Vp>0, Vg=0")  # -> saves phase_group_velocity_Vp_pos_Vg_zero.html