import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Booking.css";
import {
  getAvailableBuses,
  getBusByNumber,
  getBusesByRoute,
} from "../../Services/bus";
import { searchRutes } from "../../Services/rute";
import { createBooking, checkSeatAvailability } from "../../Services/booking";

const PaymentMethods = ["cash", "card", "upi", "wallet"];

const Booking = () => {
  const navigate = useNavigate();

  // Form state
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routeOrigin, setRouteOrigin] = useState("");
  const [routeDestination, setRouteDestination] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeBuses, setRouteBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [step, setStep] = useState(1);
  const [busNumberOrId, setBusNumberOrId] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerNames, setPassengerNames] = useState([""]);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);

  useEffect(() => {
    // Fetch a short list of available buses for quick selection
    let mounted = true;
    (async () => {
      try {
        const res = await getAvailableBuses();
        if (!mounted) return;
        if (res && res.success) setBuses(res.buses || []);
      } catch (err) {
        // ignore silently
      }
    })();

    return () => (mounted = false);
  }, []);

  const loadBusByNumber = async (val) => {
    if (!val) return setSelectedBus(null);
    try {
      setLoading(true);
      const res = await getBusByNumber(val.trim());
      if (res && res.success && res.bus) {
        setSelectedBus(res.bus);
        // reset seat selection when bus changes
        setSelectedSeats([]);
        setPassengerNames([""]);
      } else {
        setSelectedBus(null);
      }
    } catch (err) {
      setSelectedBus(null);
    } finally {
      setLoading(false);
    }
  };

  const searchRoutes = async () => {
    setError("");
    try {
      const res = await searchRutes(
        routeOrigin.trim(),
        routeDestination.trim()
      );
      // `searchRutes` normalizes many shapes; expect array
      setRoutes(res || []);
    } catch (err) {
      console.error("Error searching routes:", err);
      setError("Failed to search routes");
    }
  };

  const selectRoute = async (route) => {
    setSelectedRoute(route);
    setError("");
    try {
      const res = await getBusesByRoute(route.id || route.routeId || route._id);
      // getBusesByRoute returns normalized data; take .buses or array
      const busesForRoute =
        res?.buses || (Array.isArray(res) ? res : res?.data?.buses || []);
      setRouteBuses(busesForRoute);
    } catch (err) {
      console.error("Error fetching buses for route:", err);
      setError("Failed to load buses for selected route");
      setRouteBuses([]);
    }
  };

  const chooseBusAndContinue = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setPassengerNames([""]);
    setStep(2);
  };

  // When selectedBus or travelDate changes, refresh availability to mark taken seats
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedBus || !travelDate) return;
      // proceed to check availability for the chosen bus/date
      try {
        const res = await checkSeatAvailability({
          busId: selectedBus.id,
          travelDate,
        });
        if (!mounted) return;
        if (res && res.success && res.data && res.data.availability) {
          const { bookedSeats } = res.data.availability;
          setSelectedBus((prev) => ({
            ...(prev || {}),
            takenSeats: bookedSeats || [],
          }));
          setError("");
          setServerErrors([]);
        }
      } catch (err) {
        // Surface availability errors from server to the user
        const server = err?.response?.data;
        console.error("Availability error response:", server || err);
        if (server && server.message) setError(server.message);
        else setError(err.message || "Failed to check availability");
        if (server && server.errors && Array.isArray(server.errors)) {
          setServerErrors(server.errors);
        }
        // if availability check fails, clear takenSeats so user can still try
        setSelectedBus((prev) => ({ ...(prev || {}), takenSeats: [] }));
      }
    })();

    return () => (mounted = false);
  }, [selectedBus?.id, travelDate]);

  const toggleSeat = (seatNum) => {
    if (selectedSeats.includes(seatNum)) {
      const next = selectedSeats.filter((s) => s !== seatNum);
      setSelectedSeats(next);
      setPassengerNames((prev) => prev.slice(0, next.length) || [""]);
    } else {
      if (selectedSeats.length >= 6) return; // server limit
      setSelectedSeats((p) => [...p, seatNum]);
      setPassengerNames((prev) => [...prev, ""]);
    }
  };

  const updatePassengerName = (index, value) => {
    setPassengerNames((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // Validation is handled by the backend. The client will submit the payload and display server-side errors.

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    // No client-side blocking validation; server will validate and return errors if any.

    // Prepare payload as server expects
    // Normalize: trim passenger names and remove accidental trailing empty entries
    const passengerNamesTrimmed = passengerNames.map((p) => (p || "").trim());
    while (
      passengerNamesTrimmed.length > selectedSeats.length &&
      passengerNamesTrimmed[passengerNamesTrimmed.length - 1] === ""
    ) {
      passengerNamesTrimmed.pop();
    }

    // Normalize phone to digits only (do not auto-add country codes)
    const phoneDigits = (contactPhone || "").replace(/\D/g, "");

    const payload = {
      busId: selectedBus.id,
      seatNumbers: selectedSeats,
      travelDate,
      contactPhone: phoneDigits,
      contactEmail: contactEmail.trim(),
      passengerNames: passengerNamesTrimmed,
      boardingPoint: boardingPoint.trim() || undefined,
      droppingPoint: droppingPoint.trim() || undefined,
      specialRequests: specialRequests.trim() || undefined,
      paymentMethod,
    };

    const normalizeErrors = (arr) => {
      const map = {};
      if (!Array.isArray(arr)) return map;
      arr.forEach((it) => {
        if (!it) return;
        // field may be like 'body.passengerNames' or 'body.passengerNames.0'
        let key = it.field || it.path || "";
        // remove leading 'body.' or 'query.' or 'params.' prefixes
        key = key
          .replace(/^body\./, "")
          .replace(/^query\./, "")
          .replace(/^params\./, "");
        map[key] = it.message || it.msg || "Invalid";
      });
      return map;
    };

    try {
      setLoading(true);
      const res = await createBooking(payload);
      if (res && res.success) {
        // navigate to booking detail or my bookings
        const slug = res.data?.booking?.slug;
        if (slug) navigate(`/bookings/${slug}`);
        else navigate("/my-bookings");
      } else if (res && res.errors) {
        // Server returns array of errors; normalize into field->message map
        const map = normalizeErrors(res.errors);
        setFieldErrors(map);
        setServerErrors(Array.isArray(res.errors) ? res.errors : []);
        setError(
          res.message || "Validation failed. Please fix highlighted fields."
        );
      } else {
        setError(res?.message || "Failed to create booking");
      }
    } catch (err) {
      // Try to parse backend validation errors if available
      const server = err?.response?.data;
      console.error("Create booking error response:", server || err);
      if (server) {
        if (server.errors && Array.isArray(server.errors)) {
          setFieldErrors(normalizeErrors(server.errors));
          setServerErrors(server.errors);
        }
        setError(server.message || JSON.stringify(server));
      } else {
        setError(err.message || "Booking failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-page container">
      <h1>Book a Ticket</h1>
      <p className="muted">
        Quickly reserve seats and receive an instant booking reference.
      </p>

      <div className="booking-grid">
        <section className="left-column card">
          {step === 1 && (
            <div className="route-search">
              <label>Search route</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Origin"
                  value={routeOrigin}
                  onChange={(e) => setRouteOrigin(e.target.value)}
                />
                <input
                  placeholder="Destination"
                  value={routeDestination}
                  onChange={(e) => setRouteDestination(e.target.value)}
                />
                <button className="primary" onClick={searchRoutes}>
                  Search
                </button>
              </div>

              <div style={{ marginTop: 12 }}>
                {routes.length === 0 ? (
                  <div className="muted">
                    No routes yet. Try searching origin and destination.
                  </div>
                ) : (
                  <div>
                    <h4>Routes</h4>
                    <ul>
                      {routes.map((r) => (
                        <li
                          key={r.id || r.routeId || r.code}
                          style={{ marginBottom: 8 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <strong>
                                {r.routeName ||
                                  `${r.origin || r.from} → ${
                                    r.destination || r.to
                                  }`}
                              </strong>
                              <div className="muted">{r.description || ""}</div>
                            </div>
                            <div>
                              <button
                                className="primary"
                                onClick={() => selectRoute(r)}
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {selectedRoute && (
                <div style={{ marginTop: 12 }}>
                  <h4>Buses for route</h4>
                  {routeBuses.length === 0 && (
                    <div className="muted">No buses found for this route.</div>
                  )}
                  {routeBuses.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <strong>
                          {b.busNumber} · {b.busType}
                        </strong>
                        <div className="muted">
                          Fare: ₹{b.route?.fare || b.fare || 0}
                        </div>
                      </div>
                      <div>
                        <button
                          className="primary"
                          onClick={() => chooseBusAndContinue(b)}
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={onSubmit} className="booking-form">
              {serverErrors && serverErrors.length > 0 && (
                <div className="card" style={{ marginBottom: 12 }}>
                  <strong>Server validation errors:</strong>
                  <ul style={{ marginTop: 8 }}>
                    {serverErrors.map((err, i) => (
                      <li key={i} style={{ color: "#b00020" }}>
                        {err.field ? `${err.field}: ` : ""}
                        {err.message || JSON.stringify(err)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <label>Pick a bus (or enter number)</label>
              <div className="bus-select-row">
                <select
                  value={selectedBus?.id || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    const bus = buses.find((b) => String(b.id) === String(id));
                    if (bus) {
                      setSelectedBus(bus);
                      setBusNumberOrId(bus.busNumber || String(bus.id));
                      setSelectedSeats([]);
                      setPassengerNames([""]);
                    }
                  }}
                >
                  <option value="">-- Choose from available buses --</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} · {b.busType} · {b.route?.routeName || ""}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Or type bus number"
                  value={busNumberOrId}
                  onChange={(e) => setBusNumberOrId(e.target.value)}
                  onBlur={(e) => loadBusByNumber(e.target.value)}
                />
              </div>

              <label>Travel date</label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />

              <label>Seats (tap to select)</label>
              <div className="seat-map">
                {selectedBus ? (
                  Array.from({ length: selectedBus.capacity || 20 }).map(
                    (_, i) => {
                      const num = i + 1;
                      const taken =
                        selectedBus.takenSeats &&
                        selectedBus.takenSeats.includes(num);
                      const selected = selectedSeats.includes(num);
                      return (
                        <button
                          type="button"
                          key={num}
                          className={`seat ${
                            taken ? "taken" : selected ? "selected" : "free"
                          }`}
                          disabled={taken}
                          onClick={() => toggleSeat(num)}
                        >
                          {num}
                        </button>
                      );
                    }
                  )
                ) : (
                  <div className="muted">Choose a bus to see seat map</div>
                )}
              </div>
              {fieldErrors.seatNumbers && (
                <div className="field-error">{fieldErrors.seatNumbers}</div>
              )}

              <label>Passenger names</label>
              <div className="passenger-list">
                {selectedSeats.map((seat, idx) => (
                  <div key={seat} style={{ marginBottom: 8 }}>
                    <input
                      placeholder={`Passenger for seat ${seat}`}
                      value={passengerNames[idx] || ""}
                      onChange={(e) => updatePassengerName(idx, e.target.value)}
                      className={
                        fieldErrors[`passengerNames.${idx}`]
                          ? "input-error"
                          : ""
                      }
                    />
                    {fieldErrors[`passengerNames.${idx}`] && (
                      <div className="field-error">
                        {fieldErrors[`passengerNames.${idx}`]}
                      </div>
                    )}
                  </div>
                ))}
                {selectedSeats.length === 0 && (
                  <div className="muted">
                    Select seats to enter passenger names
                  </div>
                )}
              </div>

              <label>Contact phone</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={fieldErrors.contactPhone ? "input-error" : ""}
              />
              {fieldErrors.contactPhone && (
                <div className="field-error">{fieldErrors.contactPhone}</div>
              )}

              <label>Contact email</label>
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={fieldErrors.contactEmail ? "input-error" : ""}
              />
              {fieldErrors.contactEmail && (
                <div className="field-error">{fieldErrors.contactEmail}</div>
              )}

              <label>Boarding point (optional)</label>
              <input
                value={boardingPoint}
                onChange={(e) => setBoardingPoint(e.target.value)}
              />

              <label>Dropping point (optional)</label>
              <input
                value={droppingPoint}
                onChange={(e) => setDroppingPoint(e.target.value)}
              />

              <label>Special requests (optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />

              <label>Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PaymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m.toUpperCase()}
                  </option>
                ))}
              </select>

              {error && <div className="form-error">{error}</div>}

              <div className="form-actions">
                {step === 2 && (
                  <>
                    <button
                      type="button"
                      className="link"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                  </>
                )}
                <button type="submit" className="primary" disabled={loading}>
                  {loading
                    ? "Booking..."
                    : step === 2
                    ? "Create booking"
                    : "Next"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/my-bookings")}
                  className="link"
                >
                  My Bookings
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="right-column card">
          <h3>Summary</h3>
          <dl>
            <dt>Bus</dt>
            <dd>
              {selectedBus
                ? `${selectedBus.busNumber} · ${selectedBus.busType}`
                : selectedRoute
                ? `${
                    selectedRoute.routeName ||
                    `${selectedRoute.origin} → ${selectedRoute.destination}`
                  }`
                : "—"}
            </dd>
            <dt>Date</dt>
            <dd>{travelDate || "—"}</dd>
            <dt>Seats</dt>
            <dd>{selectedSeats.length ? selectedSeats.join(", ") : "—"}</dd>
            <dt>Passengers</dt>
            <dd>
              {passengerNames.filter((p) => p && p.trim()).join(", ") || "—"}
            </dd>
            <dt>Fare per seat</dt>
            <dd>
              {selectedBus
                ? `₹${selectedBus.route?.fare || selectedBus.fare || 0}`
                : selectedRoute
                ? `₹${selectedRoute.fare || 0}`
                : "—"}
            </dd>
            <dt>Tax (18%)</dt>
            <dd>
              {selectedBus || selectedRoute
                ? `₹${(
                    (selectedBus?.route?.fare ||
                      selectedBus?.fare ||
                      selectedRoute?.fare ||
                      0) * 0.18
                  ).toFixed(2)}`
                : "—"}
            </dd>
            <dt>Estimated total</dt>
            <dd>
              {selectedBus || selectedRoute
                ? `₹${(
                    selectedSeats.length *
                    (selectedBus?.route?.fare ||
                      selectedBus?.fare ||
                      selectedRoute?.fare ||
                      0) *
                    1.18
                  ).toFixed(2)}`
                : "—"}
            </dd>
          </dl>

          <div className="help">
            <h4>Need help?</h4>
            <p className="muted">
              You can cancel up to 2 hours before departure. For support, use
              Contact Us.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Booking;
