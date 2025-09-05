import streamlit as st
import pandas as pd
import spacy
from transformers import pipeline
from serpapi import GoogleSearch
import re

# --- Page Configuration ---
st.set_page_config(
    page_title="Knowledge-Based Fact-Checker",
    layout="wide",
)


#Named Entity Recognition (NER) uses model en_core_web_Large
@st.cache_resource
def load_spacy_model():
    """Loads the spaCy model for NER."""
    return spacy.load("en_core_web_trf")

# Use Flan-T5 for the final verification step
@st.cache_resource
def load_verification_pipeline():
    """Loads the Flan-T5 model for text-to-text generation."""
    return pipeline("text2text-generation", model="google/flan-t5-large")

# --- Core Functions ---
def extract_key_entities(text, nlp_model):
    """Uses spaCy to extract key entities (people, orgs, places) from text."""
    doc = nlp_model(text)
    
    # We are interested in key entities that are likely to be fact-checked
    important_labels = ["GPE", "ORG", "PERSON", "NORP", "LOC"]
    entities = [ent.text for ent in doc.ents if ent.label_ in important_labels]
    
    # Remove duplicates while preserving order
    unique_entities = list(dict.fromkeys(entities))
    return unique_entities

def search_for_evidence(query):
    """Searches Google for evidence using the SerpApi."""
    if not query:
        return "No query provided for searching."
        
    try:
        # Access the API key from Streamlit's secrets
        api_key = st.secrets["SERPAPI_KEY"]
        
        params = {
            "api_key": api_key,
            "engine": "google",
            "q": query,
            "gl": "us",
            "hl": "en"
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        
        # Extract snippets from organic results
        snippets = [result.get("snippet", "") for result in results.get("organic_results", [])]
        
        if not snippets:
            return "No relevant search results found."
            
        # Combine snippets into a single context string
        evidence_context = " ".join(filter(None, snippets))
        # Clean up the context a bit
        evidence_context = re.sub(r'\s+', ' ', evidence_context).strip()
        return evidence_context

    except Exception as e:
        st.error(f"Could not perform search. Please ensure your SerpApi key is correct. Error: {e}")
        return None


def verify_claim_with_evidence(claim, evidence, verifier):
    """Uses Flan-T5 to verify a claim against the gathered evidence."""
    if not evidence or "No relevant search results" in evidence:
        return "Insufficient evidence to verify the claim."

    # Construct a clear, instructional prompt for the model
    prompt = f"""
    Please analyze the following evidence and determine if the claim is true or false.
    Provide a one-word answer: "True" or "False".

    Evidence: "{evidence}"

    Claim: "{claim}"

    Answer (True or False):
    """
    
    try:
        result = verifier(prompt, max_new_tokens=10) # We only need a short answer
        # The result is a list of dictionaries, we need the generated text
        answer = result[0]['generated_text'].strip().capitalize()
        return answer
    except Exception as e:
        return f"An error occurred during verification: {e}"

# --- Streamlit UI ---

st.title("Knowledge-Based Fact-Checker")
st.markdown("VERIFY YOUR NEWS")

# Load models
nlp = load_spacy_model()
verifier = load_verification_pipeline()


# --- Main App ---
st.header("Enter News Text to Verify")

default_text = "example:The Indian government announced that Mars has officially been declared the 29th state of India."
user_input = st.text_area("Enter news headline or article text:", default_text, height=150)

if st.button("Verify News", type="primary"):
    if not user_input:
        st.warning("Please enter some text to verify.")
    else:
        # --- Step 1: Extract Entities ---
        with st.spinner("Step 1/3: Identifying key entities in the text..."):
            entities = extract_key_entities(user_input, nlp)
        
        st.subheader("1. Extracted Entities")
        if entities:
            st.write(f"Found the following key terms: **{', '.join(entities)}**")
            search_query = " ".join(entities)
        else:
            st.write("No specific entities found. Using the full text as a search query.")
            search_query = user_input
        
        st.markdown("---")

        # --- Step 2: Search for Evidence ---
        with st.spinner(f"Step 2/3: Searching Google for evidence related to '{search_query}'..."):
            evidence = search_for_evidence(search_query)

        st.subheader("2. Gathered Evidence from the Web")
        if evidence:
            st.info(evidence)
        else:
            st.error("Could not gather evidence. Cannot proceed with verification.")
        
        st.markdown("---")

        # --- Step 3: Verify Claim ---
        if evidence and "No relevant search results" not in evidence:
            with st.spinner("Step 3/3: Analyzing claim against evidence with AI..."):
                final_verdict = verify_claim_with_evidence(user_input, evidence, verifier)
            
            st.subheader("3. Final Verdict")
            if "True" in final_verdict:
                st.success(f"✅ The claim appears to be **FACTUAL** based on the evidence.")
            elif "False" in final_verdict:
                st.error(f"❌ The claim appears to be **FAKE** based on the evidence.")
            else:
                st.warning(f"🤔 The model's response was inconclusive: **{final_verdict}**")

