import { r as reactExports, W as jsxRuntimeExports } from "./server-B3eHXyXy.mjs";
import { u as useNavigate, s as supabase, L as Link, t as toast } from "./router-Bz8BsrzR.mjs";
import { H as Header, F as Footer } from "./Footer-BDJ4rQO2.mjs";
import { B as Button, c as cn, u as useComposedRefs } from "./button-B-l54qJW.mjs";
import { I as Input } from "./input-CptRtWkQ.mjs";
import { L as Label } from "./label-BVOh3ziy.mjs";
import { T as Textarea } from "./textarea-CLnseLBr.mjs";
import { u as useControllableState, e as Primitive, c as composeEventHandlers, i as useSize, a as createContextScope } from "./Combination-CTnELKZI.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, u as usePrevious } from "./select-BdM0YAI9.mjs";
import { L as LoaderCircle } from "./loader-circle-CXyMuCs0.mjs";
import { A as ArrowLeft } from "./arrow-left-DQy1lj3k.mjs";
import { X } from "./x-CxTdNuHc.mjs";
import { c as createLucideIcon } from "./createLucideIcon-BIIitENW.mjs";
import { P as Plus } from "./plus-BR_7TFQz.mjs";
const __iconNode$1 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root = Switch$1;
var Thumb = SwitchThumb;
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root.displayName;
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function ProductForm({ id, embed, onSaved, onCancel }) {
  const navigate = useNavigate();
  const fileRef = reactExports.useRef(null);
  const isEdit = !!id;
  const [loading, setLoading] = reactExports.useState(isEdit);
  const [saving, setSaving] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const [type, setType] = reactExports.useState("pack");
  const [title, setTitle] = reactExports.useState("");
  const [slug, setSlug] = reactExports.useState("");
  const [slugTouched, setSlugTouched] = reactExports.useState(false);
  const [category, setCategory] = reactExports.useState("");
  const [shortDescription, setShortDescription] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [priceXof, setPriceXof] = reactExports.useState("0");
  const [durationMonths, setDurationMonths] = reactExports.useState("");
  const [imageUrl, setImageUrl] = reactExports.useState("");
  const [featured, setFeatured] = reactExports.useState(false);
  const [published, setPublished] = reactExports.useState(true);
  const [items, setItems] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: p } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (p) {
        const product = p;
        setType(product.type);
        setTitle(product.title);
        setSlug(product.slug);
        setSlugTouched(true);
        setCategory(product.category);
        setShortDescription(product.short_description ?? "");
        setDescription(product.description ?? "");
        setPriceXof(String(product.price_xof));
        setDurationMonths(product.duration_months ? String(product.duration_months) : "");
        setImageUrl(product.image_url ?? "");
        setFeatured(product.featured);
        setPublished(product.published);
      }
      const { data: it } = await supabase.from("product_items").select("*").eq("product_id", id).order("position");
      setItems((it ?? []).map((i) => ({
        id: i.id,
        label: i.label,
        quantity: i.quantity ? String(i.quantity) : "",
        unit: i.unit ?? ""
      })));
      setLoading(false);
    })();
  }, [id]);
  reactExports.useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);
  const handleUpload = async (file) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (error) {
      toast.error("Upload échoué : " + error.message);
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !slug || !category) {
      toast.error("Titre, slug et catégorie sont requis.");
      return;
    }
    setSaving(true);
    const payload = {
      type,
      title,
      slug,
      category,
      short_description: shortDescription || null,
      description: description || null,
      price_xof: parseInt(priceXof, 10) || 0,
      duration_months: durationMonths ? parseInt(durationMonths, 10) : null,
      image_url: imageUrl || null,
      featured,
      published
    };
    let productId = id;
    if (isEdit) {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      productId = data.id;
    }
    if (productId) {
      await supabase.from("product_items").delete().eq("product_id", productId);
      const validItems = items.filter((i) => i.label.trim());
      if (validItems.length > 0) {
        await supabase.from("product_items").insert(
          validItems.map((it, idx) => ({
            product_id: productId,
            label: it.label,
            quantity: it.quantity ? Number(it.quantity) : null,
            unit: it.unit || null,
            position: idx
          }))
        );
      }
    }
    toast.success(isEdit ? "Produit mis à jour." : "Produit créé.");
    setSaving(false);
    if (onSaved) {
      onSaved();
      if (!isEdit) {
        setTitle("");
        setSlug("");
        setSlugTouched(false);
        setCategory("");
        setShortDescription("");
        setDescription("");
        setPriceXof("0");
        setDurationMonths("");
        setImageUrl("");
        setFeatured(false);
        setPublished(true);
        setItems([]);
      }
      return;
    }
    navigate({ to: "/admin/catalog" });
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  }
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    !embed && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "-ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/catalog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Retour"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: embed ? "font-display text-2xl font-semibold tracking-tight" : "mt-4 font-display text-4xl font-semibold tracking-tight", children: isEdit ? "Modifier le produit" : "Nouveau produit" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: embed ? "mt-6 space-y-8" : "mt-8 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: (v) => setType(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pack", children: "Pack agricole" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "kit", children: "Kit artisanal" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Catégorie" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: category, onChange: (e) => setCategory(e.target.value), placeholder: "Maraîchage, Couture…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Titre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Pack Maraîchage Démarrage" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Slug (URL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: slug,
              onChange: (e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              },
              placeholder: "pack-marachage-demarrage"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description courte" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: shortDescription, onChange: (e) => setShortDescription(e.target.value), maxLength: 200 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description complète" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: description, onChange: (e) => setDescription(e.target.value), rows: 5 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prix (FCFA)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: priceXof, onChange: (e) => setPriceXof(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Durée d'accompagnement (mois)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: durationMonths, onChange: (e) => setDurationMonths(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Image" }),
          imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: imageUrl, alt: "", className: "h-40 w-60 rounded-xl object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                size: "icon",
                variant: "secondary",
                className: "absolute -right-2 -top-2 h-7 w-7 rounded-full",
                onClick: () => setImageUrl(""),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileRef,
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: (e) => e.target.files?.[0] && handleUpload(e.target.files[0])
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", disabled: uploading, onClick: () => fileRef.current?.click(), children: [
              uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
              "Téléverser une image"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-6 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: featured, onCheckedChange: setFeatured }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Mis en avant" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: published, onCheckedChange: setPublished }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Publié" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-card p-6 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: "Composition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: () => setItems([...items, { label: "", quantity: "", unit: "" }]),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                "Ajouter"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
          items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Aucun élément. Ajoutez les composants du ",
            type === "pack" ? "pack" : "kit",
            "."
          ] }),
          items.map((it, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 md:grid-cols-[1fr_120px_120px_auto]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Élément (ex. Semences tomate)",
                value: it.label,
                onChange: (e) => setItems(items.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                placeholder: "Qté",
                value: it.quantity,
                onChange: (e) => setItems(items.map((x, i) => i === idx ? { ...x, quantity: e.target.value } : x))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Unité",
                value: it.unit,
                onChange: (e) => setItems(items.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon",
                className: "text-destructive",
                onClick: () => setItems(items.filter((_, i) => i !== idx)),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }, idx))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
        !embed && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, type: "button", variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/catalog", children: "Annuler" }) }),
        embed && onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving, children: [
          saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          isEdit ? "Enregistrer" : "Créer le produit"
        ] })
      ] })
    ] })
  ] });
  if (embed) {
    return content;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-4xl px-6 py-12", children: content }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  ProductForm as P,
  Trash2 as T
};
